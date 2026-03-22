import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : "";

  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const gate = await requireAdult(session);
  const gateReason = gate?.reason ? String(gate.reason) : "";

  if (!gate?.ok) {
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
      status: true,
      outcome: true,
      completedAt: true,
      buyerId: true,
      buyerFeedbackAt: true,
      sellerFeedbackAt: true,
      listing: {
        select: {
          id: true,
          sellerId: true,
          title: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const sellerId = order.listing?.sellerId ? String(order.listing.sellerId) : "";
  const buyerId = String(order.buyerId || "");

  if (!order.listing || !sellerId) {
    return NextResponse.json({ error: "Order listing is unavailable." }, { status: 409 });
  }

  const isBuyer = buyerId === userId;
  const isSeller = sellerId === userId;

  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: "Not authorised for this order." }, { status: 403 });
  }

  const role: "BUYER" | "SELLER" = isBuyer ? "BUYER" : "SELLER";
  const toUserId = isBuyer ? sellerId : buyerId;

  try {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { policyStrikes: true, policyBlockedUntil: true },
    });

    if (u?.policyBlockedUntil && u.policyBlockedUntil.getTime() > Date.now()) {
      await prisma.adminEvent.create({
        data: {
          type: "FEEDBACK_SUBMITTED_WHILE_BLOCKED",
          userId: userId,
          orderId: orderId,
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

  if (order.outcome === "CANCELLED") {
    return NextResponse.json({ error: "Feedback is not available for this order." }, { status: 409 });
  }

  if (order.outcome !== "COMPLETED") {
    return NextResponse.json({ error: "Feedback is only available after completion." }, { status: 409 });
  }

  if (role === "BUYER" && order.buyerFeedbackAt) {
    return NextResponse.json({ ok: true, alreadySubmitted: true });
  }

  if (role === "SELLER" && order.sellerFeedbackAt) {
    return NextResponse.json({ ok: true, alreadySubmitted: true });
  }

  try {
    await prisma.feedback.create({
      data: {
        orderId: orderId,
        fromUserId: userId,
        toUserId: toUserId,
        role: role,
        rating: rating,
        comment: comment || null,
      },
    });
  } catch (e: any) {
    const code = e?.code ? String(e.code) : "";
    if (code === "P2002") {
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