import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

type AnySession = any;
type AnyDbUser = any;
export type RequireAdultResult = { ok: boolean; reason?: string; status?: number; session?: AnySession; dbUser?: AnyDbUser };

function getAgeFromDob(value: unknown): number | null {
  if (!value) return null;

  const dob = new Date(value as string);
  if (Number.isNaN(dob.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age;
}

export async function requireAdult(session?: AnySession): Promise<RequireAdultResult> {
  const paramProvided = arguments.length > 0;
  const s = paramProvided ? session : await auth();
  const dbUser = (s as any)?.user;

  if (!s?.user) {
    if (!paramProvided) { redirect("/auth/login"); }
    return { ok: false, reason: "Not authenticated", status: 401, session: s, dbUser: dbUser };
  }

  const userAny = (s as any).user ?? {};
  const ageVerified = Boolean(userAny.ageVerified);
  const age = getAgeFromDob(userAny.dob ?? null);

  if (!(ageVerified || (age !== null && age >= 18))) {
    if (!paramProvided) { redirect("/account/restrictions"); }
    return { ok: false, reason: "18+ restriction", status: 403, session: s, dbUser: dbUser };
  }

  return { ok: true, session: s, dbUser: dbUser };
}
