import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { sendNewMessageEmail } from "@/lib/email";
import { containsContactInfo } from "@/lib/message-safety";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const adult = await requireAdult(session);
  if (!adult.ok) {
    return NextResponse.json({ error: adult.reason || "Restricted" }, { status: 403 });
  }

  const threadId = String(params?.id || "").trim();
  if (!threadId) {
    return NextResponse.json({ error: "Thread id is required" }, { status: 400 });
  }

  const bodyJson = await req.json().catch((): unknown => ({}));
  const text = String((bodyJson as unknown as { body?: unknown } | null | undefined)?.body || "").trim();

  if (!text) {
    return NextResponse.json({ error: "Message body is required" }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: "Message too long." }, { status: 400 });
  }

  if (containsContactInfo(text)) {
    return NextResponse.json(
      { error: "For safety, please don't share phone numbers, email addresses, or PayID/payment details in messages." },
      { status: 400 }
    );
  }

  const me = session.user.id;

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    select: { id: true, buyerId: true, sellerId: true, listingId: true },
  });

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const isParticipant = thread.buyerId === me || thread.sellerId === me;
  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();

  const msg = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        threadId: thread.id,
        userId: me,
        body: text,
        listingId: thread.listingId,
      },
      select: { id: true, body: true, createdAt: true, userId: true, threadId: true, listingId: true },
    });

    const data: any = { lastMessageAt: now, updatedAt: now };
    data.buyerDeletedAt = null;
    data.sellerDeletedAt = null;
    if (me === thread.buyerId) data.buyerLastReadAt = now;
    if (me === thread.sellerId) data.sellerLastReadAt = now;

    await tx.messageThread.update({
      where: { id: thread.id },
      data,
    });

    // Admin audit trail (for reconstructing messaging actions)
    await tx.adminEvent.create({
      data: {
        type: "MESSAGE_SENT",
        userId: me,
        data: {
          threadId: thread.id,
          listingId: thread.listingId,
          messageId: created.id,
          bodyLen: text.length,
        },
      },
    });

    return created;
  });

  // Email notify the other participant (SES-gated; dev logs when disabled)
  try {
    const otherId = thread.buyerId === me ? thread.sellerId : thread.buyerId;
    const other = await prisma.user.findUnique({ where: { id: otherId }, select: { email: true } });
    const listing = await prisma.listing.findUnique({ where: { id: thread.listingId }, select: { title: true } });
    const to = String(other?.email || "").trim();
    if (to) {
      await sendNewMessageEmail({ to, threadId: thread.id, listingTitle: listing?.title || null });
    }
  } catch (e) {
    console.warn("[EMAIL_NOTIFY] message notify failed", e);
  }

  return NextResponse.json({ ok: true, message: msg });
}
