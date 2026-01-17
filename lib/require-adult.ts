import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Enforces 18+ policy for sensitive actions.
 * IMPORTANT: Do NOT rely on session.user containing DOB/ageVerified.
 * We always fall back to the DB user record (source of truth).
 */
function getDob(user: any): Date | null {
  const raw = user?.dateOfBirth ?? user?.dob ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export function yearsOld(dob: Date, now = new Date()): number {
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

export async function requireAdult(sessionArg?: any) {
  const session = sessionArg ?? (await auth());
  const userId = session?.user?.id;

  if (!userId) {
    return { ok: false as const, status: 401, reason: "NOT_AUTHENTICATED" };
  }

  // Source of truth: DB user
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      dateOfBirth: true,
      dob: true,
      ageVerified: true,
    } as any,
  });

  const dob = getDob(dbUser);
  if (!dob) {
    return { ok: false as const, status: 403, reason: "MISSING_AGE_VERIFICATION" };
  }

  const ageVerified = Boolean((dbUser as any)?.ageVerified);
  if (!ageVerified) {
    return { ok: false as const, status: 403, reason: "AGE_NOT_VERIFIED" };
  }

  const age = yearsOld(dob);
  if (age < 18) {
    return { ok: false as const, status: 403, reason: "UNDER_18" };
  }

  return { ok: true as const, session, dbUser };
}
