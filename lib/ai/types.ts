export type AiRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type AiRecommendation =
  | "IGNORE"
  | "WARN"
  | "SUSPEND"
  | "DELETE";

export interface AiReportAnalysis {
  summary: string;
  riskLevel: AiRiskLevel;
  signals: string[];
  recommendation: AiRecommendation;
}