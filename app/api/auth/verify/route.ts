import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));
  const t = String(token ?? "").trim();
  if (!t) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const vt = await prisma.verificationToken.findUnique({ where: { token: t } });
  if (!vt || vt.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: vt.userId }, data: { emailVerified: true, isActive: true } });
  await prisma.verificationToken.delete({ where: { id: vt.id } });

  return NextResponse.json({ ok: true });
}
