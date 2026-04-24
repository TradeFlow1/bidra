function digitCount(s: string) {
  const m = s.match(/\d/g);
  return m ? m.length : 0;
}

export function containsContactInfo(input: string): boolean {
  const text = String(input || "");
  if (!text.trim()) return false;

  // Email
  const emailRe = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  if (emailRe.test(text)) return true;

  // Phone-like sequences (>= 8 digits total)
  const phoneRe = /(\+?\d[\d\s().-]{6,}\d)/g;
  const phoneHits = text.match(phoneRe) || [];
  for (const h of phoneHits) {
    if (digitCount(h) >= 8) return true;
  }

  // Payment / contact keywords (broad)
  const kwRe = /\b(payid|pay id|osko|bsb|account\s*number|acct\s*number|bank\s*transfer|email\s+me|call\s+me|text\s+me|sms\s+me)\b/i;
  if (kwRe.test(text)) return true;

  return false;
}

export function maskContactInfo(input: string): string {
  let text = String(input || "");
  if (!text) return text;

  // Mask emails
  text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email removed]");

  // Mask phone-like sequences with >= 8 digits
  text = text.replace(/(\+?\d[\d\s().-]{6,}\d)/g, (m) => {
    return digitCount(m) >= 8 ? "[phone removed]" : m;
  });

  // Mask payment keywords (leave the rest of the sentence)
  text = text.replace(/\b(payid|pay id|osko|bsb|account\s*number|acct\s*number|bank\s*transfer)\b/gi, "[payment details removed]");

  return text;
}

export function allowContactDetailsInMessages(): boolean {
  // Default: ALLOW (Friend Test mode). Set ALLOW_CONTACT_DETAILS_IN_MESSAGES=0 to re-enable blocking later.
  const v = (process.env.ALLOW_CONTACT_DETAILS_IN_MESSAGES ?? "").toString().trim().toLowerCase();
  if (!v) return true;
  if (v === "0" || v === "false" || v === "no" || v === "off") return false;
  return true;
}

export function contactInfoSignals(input: string): { email: boolean; phone: boolean; payment: boolean } {
  const text = String(input || "");

  // Keep in sync with containsContactInfo()
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

