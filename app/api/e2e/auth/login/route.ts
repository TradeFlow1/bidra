import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

function isEnabled() {
  return String(process.env.BIDRA_TEST_AUTH_ENABLED || "").trim() === "1";
}

function isLocalOrTestUrl(request: Request) {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function sessionCookieName() {
  const nextAuthUrl = String(process.env.NEXTAUTH_URL || "");
  const secure = process.env.NODE_ENV === "production" && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(\/|$)/i.test(nextAuthUrl);
  return secure ? "__Secure-next-auth.session-token" : "next-auth.session-token";
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  if (!isEnabled() || !isLocalOrTestUrl(request)) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Missing NEXTAUTH_SECRET" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
  }

  const allowed = [
    process.env.BIDRA_TEST_SELLER_EMAIL,
    process.env.BIDRA_TEST_BUYER_EMAIL,
    process.env.BIDRA_TEST_BUYER_2_EMAIL,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  if (!allowed.includes(email)) {
    return NextResponse.json({ ok: false, error: "User is not test-allowed" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: false, error: "Test user not found" }, { status: 404 });
  }

  const token = await encode({
    secret,
    token: {
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
      dob: user.dob || null,
      ageVerified: user.ageVerified || false,
      emailVerified: user.emailVerified || false,
      phoneVerified: user.phoneVerified || false,
    },
  });

  const response = NextResponse.json({ ok: true, userId: user.id });
  response.cookies.set({
    name: sessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: sessionCookieName().startsWith("__Secure-"),
    path: "/",
  });

  return response;
}
