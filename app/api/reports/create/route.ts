import { NextResponse } from "next/server";
import { requireAdult } from "@/lib/require-adult";

import { prisma } from "@/lib/prisma";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";




const ALLOWED_REASONS = new Set([
  "PROHIBITED_ITEM",
  "SCAM_OR_FRAUD",
  "MISLEADING",
  "OFFENSIVE",
  "SAFETY_RISK",
  "OTHER",
]);
export async function POST(req: Request) {
  
  const gate = await requireAdult();
  if (!gate.ok) {
    return new Response(JSON.stringify({ ok: false, reason: gate.reason }), {
      status: gate.status,
      headers: { "content-type": "application/json" },
    });
  }
try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const listingId = String(body?.listingId || "").trim();
    const reason = String(body?.reason || "").trim();
    const details = String(body?.details || "").trim();

    if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });
    if (!reason) return NextResponse.json({ error: "Reason required" }, { status: 400 });
    if (!ALLOWED_REASONS.has(reason)) return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    if (details.length > 1000) return NextResponse.json({ error: "Details too long" }, { status: 400 });

    // ensure listing exists
    const exists = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const report = await prisma.report.create({
      data: {
        listingId,
        reporterId: session.user.id,
        reason,
        details: details || null,
      },
    });

    return NextResponse.json({ ok: true, report });
  } catch (e: any) {
    console.error("Report create error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
