import crypto from "crypto";

export type SafetySignalMap = {
  email: boolean;
  phone: boolean;
  payment: boolean;
  offPlatform: boolean;
};

export function messageSafetySignals(text: string): SafetySignalMap {
  const input = String(text || "");
  const lowered = input.toLowerCase();

  const email = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(input);
  const phone = /(?:\+?61|0)[\s.-]?(?:2|3|4|7|8)?(?:[\s.-]?\d){7,9}/.test(input) || /(?:\d[\s.-]?){10,}/.test(input);
  const payment = /\b(?:payid|paypal|bank\s*transfer|bsb|account\s*number|crypto|bitcoin|btc|eth|gift\s*card|osko)\b/i.test(input);
  const offPlatform = /\b(?:whatsapp|telegram|signal|snapchat|instagram|facebook|messenger|gmail|outlook|call me|text me|sms)\b/i.test(lowered);

  return { email, phone, payment, offPlatform };
}

export function hasBlockedMessageSafetySignal(signals: SafetySignalMap): boolean {
  return signals.email || signals.phone || signals.payment || signals.offPlatform;
}

export function transactionFingerprint(parts: Array<string | number | null | undefined>): string {
  const normalized = parts.map(function (part) {
    return String(part === null || part === undefined ? "" : part).trim().toLowerCase();
  }).join("|");

  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export function getIdempotencyKey(req: Request, fallbackParts: Array<string | number | null | undefined>): string {
  const header = String(req.headers.get("idempotency-key") || req.headers.get("x-idempotency-key") || "").trim();
  if (header) return transactionFingerprint(["header", header]);
  return transactionFingerprint(["fallback"].concat(fallbackParts.map(function (part) {
    return String(part === null || part === undefined ? "" : part);
  })));
}
