import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STRIKE_THRESHOLD = 3;

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;

  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const userId = String(form.get("userId") || "");
  const backTo = String(form.get("backTo") || "");

  if (!userId) return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, policyStrikes: true, policyBlockedUntil: true },
  });

  if (!existing) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  const nextStrikes = Math.max(0, (existing.policyStrikes || 0) - 1);

  // If strikes drop below threshold, clear the block (does NOT auto-unsuspend listings â€” admin controls that separately)
  const clearBlock = nextStrikes < STRIKE_THRESHOLD;

  await prisma.user.update({
    where: { id: userId },
    data: {
      policyStrikes: nextStrikes,
      policyBlockedUntil: clearBlock ? null : existing.policyBlockedUntil,
    },
  });

  

  await prisma.adminActionLog.create({
    data: {
      adminId: user.id,
      action: "USER_UNSTRIKE",
      entityType: "USER",
      entityId: userId,
      userId,
meta: { note: "policy strike removed" },
    },
  });if (backTo) return NextResponse.redirect(new URL(backTo, req.url));
  return NextResponse.json({ ok: true, userId, policyStrikes: nextStrikes });
}
