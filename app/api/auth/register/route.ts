import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

function baseUrl() {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`auth:register:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { email, password } = await req.json().catch(() => ({}));
  const emailNorm = String(email ?? "").trim().toLowerCase();
  const passwordStr = String(password ?? "");

  if (!emailNorm.includes("@") || passwordStr.length < 8) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const hash = await bcrypt.hash(passwordStr, 10);

  const user = await prisma.user.create({
    data: { email: emailNorm, passwordHash: hash, role: "USER", emailVerified: false }
  });

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
  await prisma.verificationToken.create({
    data: { userId: user.id, token, expiresAt }
  });

  const verifyUrl = `${baseUrl()}/auth/verify?token=${token}`;
  console.log("[Bidra] Email verification link:", verifyUrl);

  return NextResponse.json({ ok: true });
}
