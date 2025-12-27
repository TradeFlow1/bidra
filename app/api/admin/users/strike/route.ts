import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STRIKE_THRESHOLD = 3;
const BLOCK_DAYS = 7;

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;

  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const userId = String(form.get("userId") || "");
  const backTo = String(form.get("backTo") || "");

  if (!userId) return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });

  // Increment strikes
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { policyStrikes: { increment: 1 } },
    select: { id: true, policyStrikes: true, policyBlockedUntil: true },
  });

  // If threshold reached, block and suspend listings
  if (updated.policyStrikes >= STRIKE_THRESHOLD) {
    const blockedUntil = new Date(Date.now() + BLOCK_DAYS * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: { policyBlockedUntil: blockedUntil },
    });

    // Suspend seller ACTIVE listings (don’t touch SOLD/ENDED etc.)
    await prisma.listing.updateMany({
      where: { sellerId: userId, status: "ACTIVE" as any },
      data: { status: "SUSPENDED" as any },
    });
  }

  if (backTo) return NextResponse.redirect(new URL(backTo, req.url));
  return NextResponse.json({ ok: true, userId, policyStrikes: updated.policyStrikes });
}