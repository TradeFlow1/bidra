import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AiReportAnalysis } from "@/lib/ai/types";
import { analyzeReportDeterministic } from "@/lib/ai/analyze";

type AiRiskLevel = "LOW" | "MEDIUM" | "HIGH";
type AiRecommendation = "IGNORE" | "WARN" | "SUSPEND" | "DELETE";


// Admin-only deterministic report analysis helper. No external AI calls are made here.
// Later we can swap the analysis engine to OpenAI without changing the UI contract.

function clampRisk(level: AiRiskLevel): AiRiskLevel {
  if (level === "LOW" || level === "MEDIUM" || level === "HIGH") return level;
  return "LOW";
}

function clampRec(rec: AiRecommendation): AiRecommendation {
  if (rec === "IGNORE" || rec === "WARN" || rec === "SUSPEND" || rec === "DELETE") return rec;
  return "IGNORE";
}

function keywordSignals(text: string): string[] {
  const t = (text || "").toLowerCase();
  const hits: string[] = [];

  const rules: Array<[string, string]> = [
    ["wire transfer", "Mentions wire transfer"],
    ["western union", "Mentions Western Union"],
    ["gift card", "Mentions gift cards"],
    ["crypto", "Mentions crypto payment"],
    ["whatsapp", "Mentions WhatsApp/off-platform messaging"],
    ["telegram", "Mentions Telegram/off-platform messaging"],
    ["bank account", "Mentions bank account details"],
    ["payid", "Mentions PayID details"],
    ["deposit", "Mentions deposit upfront"]
  ];

  for (const [needle, label] of rules) {
    if (t.includes(needle)) hits.push(label);
  }
  return hits;
}

function buildDeterministicAnalysis(input: {
  reason?: string | null;
  details?: string | null;
  title?: string | null;
  description?: string | null;
  sellerReportCount?: number;
  listingReportCount?: number;
}): AiReportAnalysis {
  const reason = (input.reason || "").toUpperCase();
  const title = input.title || "";
  const description = input.description || "";
  const details = input.details || "";
  const sellerReports = input.sellerReportCount || 0;
  const listingReports = input.listingReportCount || 0;

  const signals: string[] = [];

  if (reason) signals.push(`Report reason: ${reason}`);
  if (listingReports >= 2) signals.push(`Multiple reports on this listing (${listingReports})`);
  if (sellerReports >= 3) signals.push(`Seller has multiple reports (${sellerReports})`);

  const kw = keywordSignals([title, description, details].filter(Boolean).join(" "));
  signals.push(...kw);

  // Simple scoring
  let score = 0;
  if (reason.includes("PROHIBITED")) score += 4;
  if (reason.includes("SCAM") || reason.includes("FRAUD")) score += 4;
  if (reason.includes("MISLEADING")) score += 2;

  if (listingReports >= 2) score += 2;
  if (sellerReports >= 3) score += 2;
  if (kw.length >= 2) score += 2;
  if (kw.length >= 4) score += 3;

  let riskLevel: AiRiskLevel = "LOW";
  if (score >= 7) riskLevel = "HIGH";
  else if (score >= 4) riskLevel = "MEDIUM";

  let recommendation: AiRecommendation = "IGNORE";
  if (riskLevel === "MEDIUM") recommendation = "WARN";
  if (riskLevel === "HIGH") {
    if (reason.includes("PROHIBITED")) recommendation = "DELETE";
    else recommendation = "SUSPEND";
  }

  const summaryParts: string[] = [];
  summaryParts.push(`Risk assessed as ${riskLevel}.`);
  if (reason) summaryParts.push(`Primary reason: ${reason}.`);
  if (kw.length) summaryParts.push(`Detected ${kw.length} risk keyword signal(s).`);
  if (sellerReports) summaryParts.push(`Seller report history: ${sellerReports}.`);
  if (listingReports) summaryParts.push(`Listing report count: ${listingReports}.`);

  return {
    summary: summaryParts.join(" "),
    riskLevel: clampRisk(riskLevel),
    signals,
    recommendation: clampRec(recommendation)
  };
}

// POST { reportId: string }
export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const reportId = String(body?.reportId || "").trim();
  if (!reportId) return NextResponse.json({ error: "Missing reportId" }, { status: 400 });

  const report: any = await prisma.report.findUnique({
    where: { id: reportId },
    include: { listing: true }
  });

  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const listing: any = report.listing || null;

  const listingId = listing?.id || report.listingId || null;
  const sellerId = listing?.sellerId || null;

  const [listingReportCount, sellerReportCount] = await Promise.all([
    listingId ? prisma.report.count({ where: { listingId } }) : Promise.resolve(0),
    sellerId ? prisma.report.count({ where: { listing: { is: { sellerId } } } }) : Promise.resolve(0)
  ]);

  const analysis = analyzeReportDeterministic({
    reason: report.reason ?? report.type ?? null,
    details: report.details ?? report.message ?? report.description ?? null,
    title: listing?.title ?? null,
    description: listing?.description ?? null,
    sellerReportCount,
    listingReportCount
  });

  return NextResponse.json({ reportId, analysis });
}
