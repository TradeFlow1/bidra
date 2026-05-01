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
  return ip || "unknown";
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  if (!rateLimit("feedback:ft:" + ip, 5, 60_000)) {
    return NextResponse.json({ error: "Too many feedback messages. Please wait a minute and try again." }, { status: 429 });
  }

  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : undefined;

  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const gate = await requireAdult(session);
  const gateReason = gate?.reason ? String(gate.reason) : "";
  if (!gate?.ok) {
    const isPolicyBlock =
      gateReason.toUpperCase() === "POLICY" ||
      gateReason.toUpperCase().includes("POLICY");

    if (!isPolicyBlock) {
      return NextResponse.json({ error: `Not allowed: ${gateReason || "Restricted"}` }, { status: 403 });
    }
  }

  let body: any = null;
  try { body = await req.json(); } catch { body = null; }

  const message = String(body?.message ?? "").trim().slice(0, 2000);
  const pageUrl = String(body?.pageUrl ?? "").trim().slice(0, 500);
  const website = String(body?.website ?? "").trim().slice(0, 120);

  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  await prisma.adminEvent.create({
    data: {
      type: "FT_FEEDBACK",
      userId,
      data: {
        message,
        pageUrl: pageUrl || null,
        ip,
        userAgent: req.headers.get("user-agent") || null,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
