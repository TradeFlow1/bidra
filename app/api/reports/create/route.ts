import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { getIdempotencyKey } from "@/lib/transaction-safety";

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

  const gate = await requireAdult(session);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, reason: gate.reason || "UNDER_18" }, {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const b = body as { listingId?: unknown; reason?: unknown; details?: unknown };
    const listingId = String(b.listingId ?? "").trim();
    const reason = String(b.reason ?? "").trim();
    const details = String(b.details ?? "").trim();

    if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });
    if (!reason) return NextResponse.json({ error: "Reason required" }, { status: 400 });
    if (!ALLOWED_REASONS.has(reason)) return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    if (details.length > 1000) return NextResponse.json({ error: "Details too long" }, { status: 400 });

    const exists = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const idempotencyKey = getIdempotencyKey(req, [reporterId, listingId, reason, details]);
    const recentSince = new Date(Date.now() - 60 * 1000);
    const existingReport = await prisma.report.findFirst({
      where: {
        listingId,
        reporterId,
        reason,
        details: details ? details : null,
        createdAt: { gte: recentSince },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingReport) {
      try {
        await prisma.adminEvent.create({
          data: {
            type: "REPORT_DUPLICATE_REUSED",
            userId: reporterId,
            data: { listingId, reportId: existingReport.id, reason, idempotencyKey },
          },
        });
      } catch (_auditErr) {}

      return NextResponse.json({ ok: true, report: existingReport, duplicateReused: true });
    }

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
