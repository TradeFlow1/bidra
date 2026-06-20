import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function clean(value: unknown) {
  return String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();
}

export async function POST(request: Request, { params }: { params: { id: string; questionId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Log in to reply." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const text = clean(body?.text);

  if (text.length < 2) {
    return NextResponse.json({ ok: false, error: "Reply must be at least 2 characters." }, { status: 400 });
  }

  if (text.length > 500) {
    return NextResponse.json({ ok: false, error: "Reply must be 500 characters or less." }, { status: 400 });
  }

  const question = await prisma.listingQuestion.findFirst({
    where: { id: params.questionId, listingId: params.id, deletedAt: null },
    select: { id: true, listing: { select: { id: true, sellerId: true, status: true } } },
  });

  if (!question) {
    return NextResponse.json({ ok: false, error: "Question not found." }, { status: 404 });
  }

  if (question.listing.sellerId !== session.user.id) {
    return NextResponse.json({ ok: false, error: "Only the seller can reply." }, { status: 403 });
  }

  if (question.listing.status !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Replies are closed for this listing." }, { status: 400 });
  }

  const reply = await prisma.listingAnswer.create({
    data: { questionId: question.id, userId: session.user.id, text },
    select: {
      id: true,
      text: true,
      createdAt: true,
      user: { select: { id: true, name: true, username: true } },
    },
  });

  return NextResponse.json({ ok: true, reply });
}
