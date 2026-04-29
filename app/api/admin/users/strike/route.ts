import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingStatus, PolicyStrikeAction } from "@prisma/client";

const STRIKE_THRESHOLD = 3;
const BLOCK_DAYS = 14;


const MAX_BLOCK_DAYS = 14;
// How long a strike stays "active" before expiring automatically.
// (Reward good behaviour = strikes fall off after TTL, OR can be cleared manually.)
const STRIKE_TTL_DAYS = 30;

async function recalcActiveStrikes(userId: string) {
  const now = new Date();

  const activeCount = await prisma.policyStrike.count({
    where: {
      userId,
      clearedAt: null,
      expiresAt: { gt: now },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { policyStrikes: activeCount },
  });
  return activeCount;
}

export async function POST(req: Request) {
  const session = await auth();
  const admin = session?.user;

  if (!admin) return NextResponse.json({ ok: false, error: "Sign in required before using admin actions." }, { status: 401 });
  if (admin.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Admin role required for this trust operation." }, { status: 403 });

  const form = await req.formData();

  const userId = String(form.get("userId") || "");
  const backTo = String(form.get("backTo") || "");

  // Optional context (helps auditability + “clear when resolved” later)
  const reportId = String(form.get("reportId") || "") || null;
  const listingId = String(form.get("listingId") || "") || null;

  // Optional: action + reason. If not provided, default WARN.
  const actionRaw = String(form.get("action") || "WARN").toUpperCase();
  const reason = String(form.get("reason") || "Policy strike").trim() || "Policy strike";

  if (!userId) return NextResponse.json({ ok: false, error: "User id is required before applying this admin action." }, { status: 400 });

  const requestedAction = actionRaw;
  const action = PolicyStrikeAction.WARN;

  const expiresAt = new Date(Date.now() + STRIKE_TTL_DAYS * 24 * 60 * 60 * 1000);

  // 1) Create an auditable strike event
  await prisma.policyStrike.create({
    data: {
      userId,
      action,
      reason,
      expiresAt,
      reportId,
      listingId,
    },
  });

  // 2) Recalculate active strikes and sync the counter on User
  const activeStrikes = await recalcActiveStrikes(userId);

  await prisma.adminActionLog.create({
    data: {
      adminId: admin.id,
      action: "USER_STRIKE",
      entityType: "USER",
      entityId: userId,
      userId,
      reportId: reportId,
      listingId: listingId,
      meta: { strikeAction: action, requestedAction, reason },
    },
  });

  // 3) If threshold reached, block + suspend ACTIVE listings
  if (activeStrikes >= STRIKE_THRESHOLD) {
    const blockedUntil = new Date(Date.now() + BLOCK_DAYS * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: { policyBlockedUntil: blockedUntil },
    });
    await prisma.listing.updateMany({
      where: { sellerId: userId, status: ListingStatus.ACTIVE },
      data: { status: ListingStatus.SUSPENDED },
    });
  }

  if (backTo) return NextResponse.redirect(new URL(backTo, req.url));
  return NextResponse.json({ ok: true, userId, activeStrikes });
}
