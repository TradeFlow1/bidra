import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function clean(value: unknown) {
  return String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();
}

function publicQuestionSelect() {
  return {
    id: true,
    text: true,
    createdAt: true,
    user: { select: { id: true, name: true, username: true } },
    answers: {
      where: { deletedAt: null },
      orderBy: { createdAt: "asc" as const },
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: { select: { id: true, name: true, username: true } },
      },
    },
  };
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const questions = await prisma.listingQuestion.findMany({
    where: { listingId: params.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: publicQuestionSelect(),
  });

  return NextResponse.json({ ok: true, questions });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Log in to ask a public question." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const text = clean(body?.text);

  if (text.length < 8) {
    return NextResponse.json({ ok: false, error: "Question must be at least 8 characters." }, { status: 400 });
  }

  if (text.length > 500) {
    return NextResponse.json({ ok: false, error: "Question must be 500 characters or less." }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: { id: true, sellerId: true, status: true },
  });

  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  if (listing.status !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Questions are closed for this listing." }, { status: 400 });
  }

  if (listing.sellerId === session.user.id) {
    return NextResponse.json({ ok: false, error: "Sellers can answer public questions instead." }, { status: 400 });
  }

  const question = await prisma.listingQuestion.create({
    data: { listingId: listing.id, userId: session.user.id, text },
    select: publicQuestionSelect(),
  });

  return NextResponse.json({ ok: true, question });
}
