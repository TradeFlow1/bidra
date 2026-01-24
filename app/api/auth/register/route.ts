import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerifyEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

function baseUrl() {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

function isAtLeast18(dob: Date) {
  const now = new Date();
  const cutoff = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  return dob <= cutoff;
}

// Version label for the verbatim Legal Pack you host at /legal
const LEGAL_VERSION = "AU-18PLUS-LEGALPACK-2025-12-26";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`auth:register:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));

  // ✅ Legal acceptance (required)
  const termsAccepted = Boolean(body?.termsAccepted);
  if (!termsAccepted) {
    return NextResponse.json(
      { error: "You must accept the Terms and confirm you are 18+ to create an account." },
      { status: 400 }
    );
  }

  const emailNorm = String(body?.email ?? "").trim().toLowerCase();
  const passwordStr = String(body?.password ?? "");

  const username = String(body?.username ?? "").trim();
  const dobStr = String(body?.dob ?? "").trim(); // YYYY-MM-DD
  const country = String(body?.country ?? "AU").trim() || "AU";

  const postcode = String(body?.postcode ?? "").trim();
  const suburb = String(body?.suburb ?? "").trim();
  const state = String(body?.state ?? "").trim();

  if (!emailNorm.includes("@")) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (passwordStr.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  // Fix encoding issue: use plain hyphen
  if (username.length < 3 || username.length > 24) {
    return NextResponse.json({ error: "Username must be 3-24 characters" }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9_\.]+$/.test(username)) {
    return NextResponse.json({ error: "Username may contain letters, numbers, underscore, dot" }, { status: 400 });
  }

  const dob = new Date(dobStr);
  if (!dobStr || Number.isNaN(dob.getTime())) {
    return NextResponse.json({ error: "Date of birth required" }, { status: 400 });
  }
  if (!isAtLeast18(dob)) {
    return NextResponse.json({ error: "Bidra accounts are 18+ only" }, { status: 403 });
  }

  const hasPostcode = postcode.length > 0;
  const hasSuburb = suburb.length > 0;
  const hasState = state.length > 0;

  // Rule (launch): postcode + suburb + state are all required. No street address.
  if (!hasPostcode || !hasSuburb || !hasState) {
    return NextResponse.json({ error: "Location required: postcode + suburb + state." }, { status: 400 });
  }

  const existsEmail = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existsEmail) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const existsUsername = await prisma.user.findUnique({ where: { username } });
  if (existsUsername) return NextResponse.json({ error: "Username already taken" }, { status: 409 });

  const hash = await bcrypt.hash(passwordStr, 10);

  const stateUp = String(state ?? "").trim().toUpperCase();
  const locationText = `${postcode} ${suburb}, ${stateUp}`;

  const user = await prisma.user.create({
    data: {
      email: emailNorm,
      passwordHash: hash,
      role: "USER",
      emailVerified: false,

      username,
      name: username,
      dob,
      country,
      suburb: suburb || null,
      state: state || null,
      postcode: postcode || null,
      location: locationText || null,

      // ✅ store legal acceptance proof
      termsAcceptedAt: new Date(),
      termsVersion: LEGAL_VERSION,

      // Locked activation policy
      ageVerified: true,
      phoneVerified: false,
      isActive: false
    }
  });

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await prisma.verificationToken.create({
    data: { userId: user.id, token, expiresAt }
  });

  const verifyUrl = `${baseUrl()}/auth/verify?token=${token}`;
  await sendVerifyEmail({ to: emailNorm, verifyUrl });
  if (process.env.NODE_ENV !== "production") {
    console.log("[Bidra] Email verification link:", verifyUrl);
  }

  return NextResponse.json({ ok: true });
}
