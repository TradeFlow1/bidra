import { auth } from "@/lib/auth";

/**
 * Enforces 18+ policy for actions: list, bid, message, feedback, reports.
 * Assumes user DOB is stored on the user record as dateOfBirth or dob.
 * If your schema uses a different field name, update getDob().
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
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, status: 401, reason: "NOT_AUTHENTICATED" };
  }

  // We expect auth() to include DOB on session.user OR we fetch it in your auth callback.
  // If your current session does not include DOB, you MUST extend NextAuth callbacks to attach dob.
  const dob = getDob(session.user);
  if (!dob) {
    return { ok: false as const, status: 403, reason: "MISSING_AGE_VERIFICATION" };
  }

  const ageVerified = (session.user as any)?.ageVerified ?? false;
  if (!ageVerified) {
    return { ok: false as const, status: 403, reason: "AGE_NOT_VERIFIED" };
  }

  const age = yearsOld(dob);
  if (age < 18) {
    return { ok: false as const, status: 403, reason: "UNDER_18" };
  }

  return { ok: true as const, session };
}
