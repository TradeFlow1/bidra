import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function e164ish(raw: string) {
  const s = String(raw ?? "").trim().replace(/\s+/g, "");
  if (!s) return "";
  if (s.startsWith("+")) return s;
  if (s.startsWith("04") && s.length >= 10) return "+61" + s.slice(1);
  return s;
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id ?? null;
  const emailVerified = Boolean((session?.user as any)?.emailVerified);

  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!emailVerified) return NextResponse.json({ error: "Verify email first" }, { status: 403 });

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`auth:phone:confirm:${userId}:${ip}`, 8, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const phone = e164ish(String(body?.phone ?? ""));
  const code = String(body?.code ?? "").trim();

  if (!phone || phone.length < 8) return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  if (!code || code.length < 3) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  const accountSid = mustEnv("TWILIO_ACCOUNT_SID");
  const authToken = mustEnv("TWILIO_AUTH_TOKEN");
  const serviceSid = mustEnv("TWILIO_VERIFY_SERVICE_SID");

  const basic = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;

  const form = new URLSearchParams();
  form.set("To", phone);
  form.set("Code", code);

  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
    cache: "no-store",
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    return NextResponse.json({ error: "Incorrect code", detail: t.slice(0, 180) }, { status: 400 });
  }

  const data: any = await r.json().catch(() => ({}));
  const status = String(data?.status ?? "").toLowerCase();
  if (status !== "approved") {
    return NextResponse.json({ error: "Code not approved" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { phone, phoneVerified: true, isActive: true },
    select: { id: true },
  });

  return NextResponse.json({ ok: true });
}
