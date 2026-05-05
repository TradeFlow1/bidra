import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { sendNewMessageEmail } from "@/lib/email";
import { getIdempotencyKey, hasBlockedMessageSafetySignal, messageSafetySignals } from "@/lib/transaction-safety";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required to use Bidra messages." }, { status: 401 });
  }

  const adult = await requireAdult(session);
  if (!adult.ok) {
    return NextResponse.json({ error: "Your account is not eligible to use Bidra messages." }, { status: 403 });
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

  const signals = messageSafetySignals(text);
  const hasContact = hasBlockedMessageSafetySignal(signals);
  const me = session.user.id;

  if (hasContact) {
    await prisma.adminEvent.create({
      data: {
        type: "MESSAGE_CONTACT_DETAILS_BLOCKED",
        userId: me,
        data: {
          threadId,
          bodyLen: text.length,
          signals,
        },
      },
    });

    return NextResponse.json(
      { ok: false, error: "For safety, keep contact details and payment details inside Bidra messages." },
      { status: 400 }
    );
  }

  const idempotencyKey = getIdempotencyKey(req, [me, threadId, text]);

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    select: { id: true, buyerId: true, sellerId: true, listingId: true },
  });

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const isParticipant = thread.buyerId === me || thread.sellerId === me;
  if (!isParticipant) {
    return NextResponse.json({ error: "You can only access message threads you are part of." }, { status: 403 });
  }

  const now = new Date();

  const msg = await prisma.$transaction(async (tx) => {
    const since = new Date(now.getTime() - 60 * 1000);
    const existing = await tx.message.findFirst({
      where: {
        threadId: thread.id,
        userId: me,
        body: text,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, body: true, createdAt: true, userId: true, threadId: true, listingId: true },
    });

    if (existing) {
      await tx.adminEvent.create({
        data: {
          type: "MESSAGE_DUPLICATE_REUSED",
          userId: me,
          data: { threadId: thread.id, listingId: thread.listingId, messageId: existing.id, idempotencyKey },
        },
      });
      return existing;
    }

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

    await tx.adminEvent.create({
      data: {
        type: "MESSAGE_SENT",
        userId: me,
        data: {
          threadId: thread.id,
          listingId: thread.listingId,
          messageId: created.id,
          bodyLen: text.length,
          idempotencyKey,
        },
      },
    });

    return created;
  });

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
