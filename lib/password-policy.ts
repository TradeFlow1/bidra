export type PasswordPolicyResult = { ok: boolean; reason?: string; warning?: string; label?: "weak" | "ok" | "strong" };

// Guidance-focused policy: enforce minimum + block trivially bad passwords; provide warnings for weak choices.
const COMMON = [
  "password",
  "password1",
  "12345678",
  "qwerty123",
  "iloveyou",
  "letmein",
  "admin123",
];

function norm(s: string) { return String(s || "").trim().toLowerCase(); }

export function checkPasswordPolicy(password: string): PasswordPolicyResult {
  const p = String(password || "");
  if (p.length < 8) return { ok: false, reason: "Password must be at least 8 characters.", label: "weak" };
  const n = norm(p);
  if (COMMON.indexOf(n) >= 0) return { ok: false, reason: "Password is too common. Choose a unique passphrase.", label: "weak" };

  // Strength labels (guidance only)
  const hasLower = /[a-z]/.test(p);
  const hasUpper = /[A-Z]/.test(p);
  const hasDigit = /\d/.test(p);
  const hasSym = /[^a-zA-Z0-9]/.test(p);
  const variety = (hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSym ? 1 : 0);

  if (p.length >= 16 && variety >= 2) return { ok: true, label: "strong" };
  if (p.length >= 12 && variety >= 2) return { ok: true, label: "ok" };

  const warning = "Tip: use a 12+ character passphrase (3â€“4 words). Avoid reused or common passwords.";
  return { ok: true, warning, label: "weak" };
}

export function passwordGuidanceText() {
  return "Use 12+ characters (a passphrase). Avoid reused or common passwords.";
}
