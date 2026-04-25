export function contactInfoSignals(input: string): { email: boolean; phone: boolean; payment: boolean } {
  const text = String(input || "");
  const emailRe = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const hasEmail = emailRe.test(text);

  const phoneRe = /(\+?\d[\d\s().-]{6,}\d)/g;
  const phoneHits = text.match(phoneRe) || [];
  const digitCount = (s: string) => (String(s || "").match(/\d/g) || []).length;
  const hasPhone = phoneHits.some((h) => digitCount(h) >= 8);

  const kwRe = /\b(payid|pay id|osko|bsb|account\s*number|acct\s*number|bank\s*transfer|email\s+me|call\s+me|text\s+me|sms\s+me)\b/i;
  const hasPayment = kwRe.test(text);

  return { email: hasEmail, phone: hasPhone, payment: hasPayment };
}
