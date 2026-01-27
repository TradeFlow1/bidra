import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

const ALLOWED_REASONS = new Set([
  "PROHIBITED_ITEM",
  "SCAM_OR_FRAUD",
  "MISLEADING",
  "OFFENSIVE",
  "SAFETY_RISK",
  "OTHER",
]);

export async function POST(req: Request) {
  const session = await auth();
  const reporterId = session?.user?.id ? String(session.user.id) : undefined;

  if (!reporterId) {
    return NextResponse.json({ ok: false, reason: "NOT_AUTHENTICATED" }, {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Enforce 18+ (browse-only for under-18)
  const gate = await requireAdult(session);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, reason: gate.reason || "UNDER_18" }, {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const listingId = String((body as any)?.listingId || "").trim();
    const reason = String((body as any)?.reason || "").trim();
    const details = String((body as any)?.details || "").trim();

    if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });
    if (!reason) return NextResponse.json({ error: "Reason required" }, { status: 400 });
    if (!ALLOWED_REASONS.has(reason)) return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    if (details.length > 1000) return NextResponse.json({ error: "Details too long" }, { status: 400 });

    const exists = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const report = await prisma.report.create({
      data: {
        listingId,
        reporterId,
        reason,
        details: details ? details : null,
      },
    });

    return NextResponse.json({ ok: true, report });
  } catch (e: any) {
    console.error("Report create error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
