import { prisma } from "@/lib/prisma";

export async function applyPolicyStrike(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { policyStrikes: true, policyBlockedUntil: true },
  });

  const strikes = (user?.policyStrikes ?? 0) + 1;

  // Block ladder:
  // 3 strikes -> 24 hours
  // 5 strikes -> 7 days
  let blockedUntil: Date | null = user?.policyBlockedUntil ?? null;
  const now = new Date();

  if (strikes >= 5) blockedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  else if (strikes >= 3) blockedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { policyStrikes: strikes, policyBlockedUntil: blockedUntil },
  });

  return { strikes, blockedUntil };
}

export async function isPolicyBlocked(userId: string) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { policyBlockedUntil: true },
  });

  if (me?.policyBlockedUntil && me.policyBlockedUntil.getTime() > Date.now()) {
    return { blocked: true as const, until: me.policyBlockedUntil };
  }
  return { blocked: false as const, until: null as any };
}
