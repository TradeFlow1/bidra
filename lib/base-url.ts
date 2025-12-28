import { headers } from "next/headers";

/**
 * Returns the correct origin for server-side absolute URLs.
 * Priority:
 * 1) NEXTAUTH_URL (recommended to set in production env)
 * 2) NEXT_PUBLIC_SITE_URL (if you choose to use it)
 * 3) Request headers (works on platforms/proxies)
 */
export function getBaseUrl() {
  const envUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const h = headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("x-forwarded-host") || h.get("host");
  return `${proto}://${host}`.replace(/\/$/, "");
}
