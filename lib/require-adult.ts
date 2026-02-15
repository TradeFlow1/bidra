import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

type AnySession = any;
type AnyDbUser = any;
export type RequireAdultResult = { ok: boolean; reason?: string; status?: number; session?: AnySession; dbUser?: AnyDbUser };

export async function requireAdult(session?: AnySession): Promise<RequireAdultResult> {
  // Key rule: redirect only when session param was NOT provided.
  // API routes pass session (even null) and must never throw NEXT_REDIRECT.
  const paramProvided = arguments.length > 0;
  const s = paramProvided ? session : await auth();
  const dbUser = (s as any)?.user;

  if (!s?.user) {
    if (!paramProvided) { redirect("/auth/login"); }
    return { ok: false, reason: "Not authenticated", status: 401, session: s, dbUser: dbUser };
  }

  const age = (s as any).user?.age;
  if (!age || age < 18) {
    if (!paramProvided) { redirect("/account/restrictions"); }
    return { ok: false, reason: "18+ restriction", status: 403, session: s, dbUser: dbUser };
  }

  return { ok: true, session: s, dbUser: dbUser };
}
