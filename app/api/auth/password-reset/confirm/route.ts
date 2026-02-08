import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { checkPasswordPolicy } from "@/lib/password-policy";

function bad(msg: string, code = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status: code });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const token = String(body?.token || "").trim();
  const newPassword = String(body?.newPassword || "");

  if (!token || newPassword.length < 8) {
    return bad("Invalid token or password too short.");
  }

  const pw = checkPasswordPolicy(newPassword);
  if (!pw.ok) {
    return bad(pw.reason || "Password is too weak.");
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const rec = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!rec) return bad("Invalid or expired token.");
  if (rec.expiresAt.getTime() < Date.now()) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: rec.userId } });
    return bad("Invalid or expired token.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: rec.userId },
    data: { passwordHash },
  });

  await prisma.passwordResetToken.deleteMany({ where: { userId: rec.userId } });

  return NextResponse.json({ ok: true });
}
