import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function recalcActiveStrikes(userId: string) {
  const now = new Date();

  const activeCount = await prisma.policyStrike.count({
    where: {
      userId,
      clearedAt: null,
      expiresAt: { gt: now },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { policyStrikes: activeCount },
  });
return activeCount;
}

export async function POST(req: Request) {
  const session = await auth();
  const admin = session?.user as any;

  if (!admin) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (admin.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const form = await req.formData();

  const strikeId = String(form.get("strikeId") || "");
  const backTo = String(form.get("backTo") || "");
  const clearedReason = String(form.get("clearedReason") || "Issue resolved").trim() || "Issue resolved";

  if (!strikeId) return NextResponse.json({ ok: false, error: "Missing strikeId" }, { status: 400 });

  const strike = await prisma.policyStrike.findUnique({
    where: { id: strikeId },
    select: { id: true, userId: true, clearedAt: true },
  });

  if (!strike) return NextResponse.json({ ok: false, error: "Strike not found" }, { status: 404 });

  // If already cleared, just recalc and return
  if (!strike.clearedAt) {
    await prisma.policyStrike.update({
      where: { id: strikeId },
      data: {
        clearedAt: new Date(),
        clearedReason,
        clearedById: admin.id,
      },
    });
  }

  const activeStrikes = await recalcActiveStrikes(strike.userId);

  if (backTo) return NextResponse.redirect(new URL(backTo, req.url));
  return NextResponse.json({ ok: true, strikeId, userId: strike.userId, activeStrikes });
}
