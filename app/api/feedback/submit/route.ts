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
  const rating = Number(body?.rating);
  const comment = typeof body?.comment === "string" ? body.comment.trim() : null;

  if (!orderId || !Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

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

      // 3) If BOTH submitted, mark completedAt + outcome=COMPLETED (only if still PENDING)
      const updated = await tx.order.findUnique({ where: { id: order.id } });

      const bothSubmitted =
        !!updated?.buyerFeedbackAt && !!updated?.sellerFeedbackAt;

      if (bothSubmitted && !updated?.completedAt && canAutoComplete) {
        await tx.order.update({
          where: { id: order.id },
          data: {
            completedAt: now,
            outcome: "COMPLETED" as any,
          },
        });
      }
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

  
    // AUTO_COMPLETE_ON_FEEDBACK
    // If both parties have submitted feedback, mark the order completed.
    try {
      const after = await prisma.order.findUnique({
        where: { id: orderId },
        select: { buyerFeedbackAt: true, sellerFeedbackAt: true, outcome: true },
      });

      if (after?.buyerFeedbackAt && after?.sellerFeedbackAt && after.outcome !== "COMPLETED") {
        await prisma.order.update({
          where: { id: orderId },
          data: { outcome: "COMPLETED", completedAt: new Date() },
        });
      }
    } catch (e) {
      // Non-fatal: feedback submission should still succeed even if completion update fails
      console.error("Auto-complete order failed:", e);
    }
return NextResponse.json({ ok: true });
}
