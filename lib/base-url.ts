/**
 * Returns the correct origin for server-side absolute URLs.
 * IMPORTANT: Do NOT import next/headers here (can break in mixed contexts).
 */
export function getBaseUrl() {
  // Prefer explicit canonical URL
  const fromEnv =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (fromEnv) return fromEnv;

  // Safe local fallback
  return "http://localhost:3000";
}
