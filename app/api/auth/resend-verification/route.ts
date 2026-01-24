import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendVerifyEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const url = new URL(req.url);
  return NextResponse.redirect(new URL("/auth/login?resend=1", url));
}


function baseUrl() {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const email = String(body?.email ?? "").trim().toLowerCase();

    // Non-enumerating: always OK
    if (!email) return NextResponse.json({ ok: true });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });

    // If user missing or already verified: still return ok (non-enumerating)
    if (!user || user.emailVerified) return NextResponse.json({ ok: true });

    // Create a fresh token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 mins

    await prisma.verificationToken.create({
      data: { token, expiresAt, userId: user.id },
    });

    const verifyUrl = `${baseUrl()}/auth/verify?token=${token}`;

    // Dev helper only (never leak links in production)
    if (String(process.env.SES_ENABLED ?? "").trim() !== "1") {
      if (process.env.NODE_ENV !== "production") {
        console.log("DEV_SES_ENABLED:", String(process.env.SES_ENABLED ?? ""));
        console.log("DEV_VERIFY_URL:", verifyUrl);
        return NextResponse.json({ ok: true, devVerifyUrl: verifyUrl });
      }
      return NextResponse.json({ ok: true });
    }

    await sendVerifyEmail({ to: email, verifyUrl });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("RESEND_VERIFY_ERR", e);
    return NextResponse.json({ ok: true });
  }
}
