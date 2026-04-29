const MAX_BLOCK_DAYS = 14;
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user) return NextResponse.json({ ok: false, error: "Sign in required before using admin actions." }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Admin role required for this trust operation." }, { status: 403 });

  const form = await req.formData();
  const userId = String(form.get("userId") || "");
  const backTo = String(form.get("backTo") || "");

  // Clamp days to [1..14]
  const rawDays = Number(form.get("days") || 7);
  const days = Math.max(1, Math.min(MAX_BLOCK_DAYS, isFinite(rawDays) ? rawDays : 7));
  if (!userId) return NextResponse.json({ ok: false, error: "User id is required before applying this admin action." }, { status: 400 });
  if (!days) return NextResponse.json({ ok: false, error: "Block duration must be between 1 and 14 days." }, { status: 400 });

  const blockedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { policyBlockedUntil: blockedUntil },
  });

  

  await prisma.adminActionLog.create({
    data: {
      adminId: user.id,
      action: "USER_BLOCK",
      entityType: "USER",
      entityId: userId,
      userId,
      meta: { note: "Manual block applied after trust-operations review.", days },
    },
  });if (backTo) return NextResponse.redirect(new URL(backTo, req.url));
  return NextResponse.json({ ok: true, userId, blockedUntil });
}
