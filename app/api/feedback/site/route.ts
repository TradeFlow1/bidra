import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0]?.trim();
  return ip || null;
}

export async function POST(req: Request) {
  const ip = getClientIp(req) || "unknown";

  if (!rateLimit("feedback:site:" + ip, 5, 60_000)) {
    return NextResponse.json({ error: "Too many feedback messages. Please wait a minute and try again." }, { status: 429 });
  }

  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : null;

  // If signed in, enforce 18+ (policy-block still allowed to submit feedback).
  if (userId) {
    const gate = await requireAdult(session);
    const gateReason = gate?.reason ? String(gate.reason) : "";
    if (!gate?.ok) {
      const isPolicyBlock =
        gateReason.toUpperCase().includes("BLOCK") ||
        gateReason.toUpperCase().includes("RESTRICT") ||
        gateReason.toUpperCase().includes("POLICY");

      if (!isPolicyBlock) {
        return NextResponse.json({ error: `Not allowed: ${gateReason || "Restricted"}` }, { status: 403 });
      }
    }
  }

  let body: any = null;
  try { body = await req.json(); } catch { body = null; }

  const category = String(body?.category ?? "").trim().slice(0, 40);
  const message = String(body?.message ?? "").trim().slice(0, 2000);
  const pageUrl = String(body?.pageUrl ?? "").trim().slice(0, 500);
  const email = String(body?.email ?? "").trim().slice(0, 320);
  const website = String(body?.website ?? "").trim().slice(0, 120); // honeypot

  if (website) {
    // silent success to frustrate bots
    return NextResponse.json({ ok: true });
  }

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  await prisma.adminEvent.create({
    data: {
      type: "SITE_FEEDBACK",
      userId,
      data: {
        category: category || null,
        message,
        pageUrl: pageUrl || null,
        email: email || null,
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") || null,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
