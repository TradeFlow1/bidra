import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recomputeUserBadges } from "@/lib/reputation/badges";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth().catch(() => null);
    const role = (session?.user as any)?.role;

    const body = await req.json().catch(() => ({}));
    const userId = typeof body?.userId === "string" ? body.userId : "";

    if (!userId) {
      return NextResponse.json({ ok: false, error: "missing_userId" }, { status: 400 });
    }

    const isAdmin = role === "ADMIN";
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    await recomputeUserBadges(userId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
