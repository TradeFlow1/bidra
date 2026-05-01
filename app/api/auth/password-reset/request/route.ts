import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "\@/lib/email";
import { rateLimit } from "@/lib/rate-limit";


function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0]?.trim();
  return ip || "unknown";
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  if (!rateLimit("auth:password-reset:" + ip, 5, 60_000)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();

    // Always respond ok to avoid account enumeration.
    if (!email) return NextResponse.json({ ok: true });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ ok: true });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    // Keep one active token per user (simple baseline)
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${base}/reset-password?token=${token}`;

    // Send reset email (non-enumerating: always return ok)
    await sendPasswordResetEmail({ to: email, resetUrl });

    return NextResponse.json({ ok: true });
  } catch {
    // Still return ok to avoid leaking info
    return NextResponse.json({ ok: true });
  }
}
