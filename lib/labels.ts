export function labelCategory(v?: string | null): string {
  if (!v) return "";
  // Categories in Bidra are stored as human strings already (e.g. "Home & Furniture").
  // But some legacy/test values may come through. Clean lightly:
  return String(v)
    .replace(/\s+/g, " ")
    .trim();
}

const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  NEW_WITH_TAGS: "New with tags",
  LIKE_NEW: "Like new",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  USED: "Used",
  FOR_PARTS: "For parts / not working",
};

export function labelCondition(v?: string | null): string {
  if (!v) return "";
  const key = String(v).trim().toUpperCase();
  return CONDITION_LABELS[key] || key.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}
