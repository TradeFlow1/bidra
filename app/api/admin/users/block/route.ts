import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;

  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const userId = String(form.get("userId") || "");
  const daysStr = String(form.get("days") || "0");
  const backTo = String(form.get("backTo") || "");

  const days = Math.max(0, Math.min(365, parseInt(daysStr, 10) || 0));
  if (!userId) return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
  if (!days) return NextResponse.json({ ok: false, error: "Missing/invalid days" }, { status: 400 });

  const blockedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { policyBlockedUntil: blockedUntil },
  });

  if (backTo) return NextResponse.redirect(new URL(backTo, req.url));
  return NextResponse.json({ ok: true, userId, blockedUntil });
}