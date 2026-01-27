import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: { user?: { role?: string | null; isAdmin?: boolean | null } } | null) {
  return Boolean(session?.user?.role === "ADMIN" || session?.user?.isAdmin === true);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    if (!isAdmin(session)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const dobStr = String(body?.dob ?? "").trim(); // YYYY-MM-DD

    if (!email) return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
    if (!dobStr) return NextResponse.json({ ok: false, error: "dob required (YYYY-MM-DD)" }, { status: 400 });

    const dob = new Date(dobStr);
    if (Number.isNaN(dob.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid dob" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    await prisma.user.update({
      where: { id: user.id },
      data: { dob, ageVerified: true },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("repair-age error:", e);
    return NextResponse.json({ ok: false, error: e?.message || "Internal server error" }, { status: 500 });
  }
}
