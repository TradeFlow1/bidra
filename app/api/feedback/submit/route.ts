import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Gate: must be 18+. Policy-block normally blocks actions, BUT feedback is allowed to prevent trust deadlocks.
  const gate = await requireAdult(session as any);
  const gateReason = (gate as any)?.reason ? String((gate as any).reason) : "";

  if (!(gate as any)?.ok) {
    const isPolicyBlock =
      gateReason.toUpperCase().includes("BLOCK") ||
      gateReason.toUpperCase().includes("RESTRICT") ||
      gateReason.toUpperCase().includes("POLICY");

    if (!isPolicyBlock) {
      return NextResponse.json({ error: `Not allowed: ${gateReason || "Restricted"}` }, { status: 403 });
    }
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const orderId = String(body?.orderId ?? "");
  const ratingRaw = Number(body?.rating ?? 0);
  const rating = Number.isFinite(ratingRaw) ? ratingRaw : 0;
  const comment = String(body?.comment ?? "").slice(0, 2000);

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  }
  if (!(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      buyerId: true,
      buyerFeedbackAt: true,
      sellerFeedbackAt: true,
      listing: { select: { id: true, sellerId: true, title: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (!order.listing || !(order.listing as any).sellerId) {
    return NextResponse.json({ error: "Order listing is unavailable." }, { status: 409 });
  }

  const sellerId = order.listing.sellerId;
  const buyerId = order.buyerId;

  let role: "BUYER" | "SELLER";
  let toUserId: string;

  if (userId === buyerId) {
    role = "BUYER";
    toUserId = sellerId;
  } else if (userId === sellerId) {
    role = "SELLER";
    toUserId = buyerId;
  } else {
    return NextResponse.json({ error: "Not authorised for this order." }, { status: 403 });
  }

  // FEEDBACK_SUBMIT_DESPITE_BLOCK (Admin visibility)
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
      });
    }
  } catch (e) {
    console.warn("[ADMIN_VISIBILITY] Failed to log feedback-despite-block", e);
  }

  try {
    await prisma.feedback.create({
      data: {
        orderId,
        fromUserId: userId,
        toUserId,
        role,
        rating,
        comment: comment || null,
      },
    });
  } catch (e: any) {
    // Duplicate feedback (Prisma unique constraint) -> treat as "already submitted"
    const code = e?.code ? String(e.code) : "";
    if (code === "P2002") {
      // Idempotent submit: if feedback already exists, still ensure the order timestamp is set so gates unblock immediately.
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: role === "BUYER" ? { buyerFeedbackAt: new Date() } : { sellerFeedbackAt: new Date() },
        });
      } catch (e2) {
        console.error("order.update failed after duplicate feedback submit", e2);
      }
      return NextResponse.json({ ok: true, alreadySubmitted: true });
    }
    console.error("feedback.create failed", e);
    return NextResponse.json({ error: "Failed to submit feedback." }, { status: 500 });
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: role === "BUYER" ? { buyerFeedbackAt: new Date() } : { sellerFeedbackAt: new Date() },
    });
  } catch (e) {
    console.error("order.update failed after feedback submit", e);
    return NextResponse.json({ error: "Feedback saved, but failed to update order." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
