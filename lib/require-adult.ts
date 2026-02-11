import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

type AnySession = any;
type AnyDbUser = any;
export type RequireAdultResult = { ok: boolean; reason?: string; status?: number; session?: AnySession; dbUser?: AnyDbUser };

export async function requireAdult(session?: AnySession): Promise<RequireAdultResult> {
  const s = session || (await auth());
  const dbUser = (s as any)?.user;

  if (!s?.user) {
    if (!session) { redirect("/auth/login"); }
    return { ok: false, reason: "Not authenticated", status: 401, session: s, dbUser: dbUser };
  }

  const age = (s as any).user?.age;
  if (!age || age < 18) {
    if (!session) { redirect("/account/restrictions"); }
    return { ok: false, reason: "18+ restriction", status: 403, session: s, dbUser: dbUser };
  }

  return { ok: true, session: s, dbUser: dbUser };
}

