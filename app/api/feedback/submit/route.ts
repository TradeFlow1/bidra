import { NextResponse } from "next/server";
import { requireAdult } from "@/lib/require-adult";


import { prisma } from "@/lib/prisma";


import { getServerSession } from "next-auth";


import { authOptions } from "@/lib/auth";



export async function POST(req: Request) {
  
  const gate = await requireAdult();
  if (!gate.ok) {
    return new Response(JSON.stringify({ ok: false, reason: gate.reason }), {
      status: gate.status,
      headers: { "content-type": "application/json" },
    });
  }
const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const orderId = String(body?.orderId ?? "");
  // FEEDBACK_SUBMIT_DESPITE_BLOCK
  // Feedback must remain possible even if the user is policy-blocked (prevents trust deadlocks).
  // We log this so admins can see trust-repair happening during restrictions.
  try {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { policyStrikes: true, policyBlockedUntil: true },
    });

    if (u?.policyBlockedUntil && u.policyBlockedUntil.getTime() > Date.now()) {
            await prisma.adminEvent.create({
        data: {
          type: "FEEDBACK_SUBMITTED_WHILE_BLOCKED",
          userId,
          orderId,
          data: {
            policyStrikes: u.policyStrikes,
            policyBlockedUntil: u.policyBlockedUntil,
          },
        },
      });}
  } catch (e) {
          await prisma.adminEvent.create({
        data: {
          type: "FEEDBACK_SUBMITTED_WHILE_BLOCKED",
          userId,
          orderId,
          data: {
            policyStrikes: u.policyStrikes,
            policyBlockedUntil: u.policyBlockedUntil,
          },
        },
      });}

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { listing: { select: { sellerId: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const isBuyer = order.buyerId === userId;
  const isSeller = order.listing?.sellerId === userId;

  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  // Only auto-complete if order is still PENDING
  const canAutoComplete = order.outcome === "PENDING";

  const toUserId = isBuyer ? order.listing!.sellerId : order.buyerId;
  const role = isBuyer ? "BUYER" : "SELLER";
  const now = new Date();

  try {
    await prisma.$transaction(async (tx: any) => {
      // 1) Create feedback (unique on [orderId, fromUserId])
      await tx.feedback.create({
        data: {
          orderId: order.id,
          fromUserId: userId,
          toUserId,
          role: role as any,
          rating: Math.trunc(rating),
          comment: comment || null,
        },
      });

      // 2) Stamp buyer/seller feedback timestamp
      await tx.order.update({
        where: { id: order.id },
        data: isBuyer ? { buyerFeedbackAt: now } : { sellerFeedbackAt: now },
      });
    });
  } catch (e: any) {
    // Log real error so we can diagnose (P2002 vs other)
    console.error("feedback submit error:", e);

    const code = e?.code || e?.cause?.code;

    // Prisma unique constraint violation (duplicate feedback)
    if (code === "P2002") {
      return NextResponse.json({ error: "Feedback already submitted" }, { status: 409 });
    }

    return NextResponse.json({ error: "Feedback submit failed" }, { status: 500 });
  }
return NextResponse.json({ ok: true });
}
