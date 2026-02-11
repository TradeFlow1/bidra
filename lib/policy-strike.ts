import { prisma } from "@/lib/prisma";
import { ListingStatus, PolicyStrikeAction } from "@prisma/client";

// Canonical rules (match /api/admin/users/strike)
const STRIKE_THRESHOLD = 3;
const STRIKE_TTL_DAYS = 30;
const BLOCK_DAYS = 14;

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

export async function applyPolicyStrike(userId: string) {
  if (!userId) throw new Error("applyPolicyStrike: missing userId");

  const expiresAt = new Date(Date.now() + STRIKE_TTL_DAYS * 24 * 60 * 60 * 1000);

  // 1) Create auditable strike event (default WARN)
  await prisma.policyStrike.create({
    data: {
      userId,
      action: PolicyStrikeAction.WARN,
      reason: "Policy strike",
      expiresAt,
    },
  });

  // 2) Recalculate active strikes and sync counter on User
  const strikes = await recalcActiveStrikes(userId);

  // 3) If threshold reached, block + suspend ACTIVE listings
  if (strikes >= STRIKE_THRESHOLD) {
    const blockedUntil = new Date(Date.now() + BLOCK_DAYS * 24 * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: userId },
      data: { policyBlockedUntil: blockedUntil },
    });
    await prisma.listing.updateMany({
      where: { sellerId: userId, status: ListingStatus.ACTIVE },
      data: { status: ListingStatus.SUSPENDED },
    });
    return { strikes, blockedUntil };
  }

  // Return current block value (if any) for convenience
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { policyBlockedUntil: true },
  });
  return { strikes, blockedUntil: me?.policyBlockedUntil ?? null };
}

export async function isPolicyBlocked(userId: string) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { policyBlockedUntil: true },
  });

  if (me?.policyBlockedUntil && me.policyBlockedUntil.getTime() > Date.now()) {
    return { blocked: true as const, until: me.policyBlockedUntil };
  }
  return { blocked: false as const, until: null as Date | null };
}

