/* eslint-disable @typescript-eslint/no-explicit-any */
export function isTimedOffersType(type: any): boolean {
  const t = String(type ?? "").toUpperCase().trim();
  return t === "AUCTION"; // schema enum value, UI name is "Timed offers"
}

