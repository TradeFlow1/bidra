import type { AiReportAnalysis, AiRiskLevel, AiRecommendation } from "@/lib/ai/types";

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

export function analyzeReportDeterministic(input: {
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