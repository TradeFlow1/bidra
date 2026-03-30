export function isTimedOffersType(type: any): boolean {
  const t = String(type ?? "").toUpperCase().trim();
  return t === "OFFERABLE" || t === "AUCTION"; // accept legacy alias while UI uses timed offers wording
}
