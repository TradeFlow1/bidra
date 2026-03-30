export const SITE_NAME = "Bidra";
export const SITE_HOST = "www.bidra.com.au";
export const SITE_URL = "https://www.bidra.com.au";

export function normalizeSiteUrl(value?: string | null) {
  if (!value) return SITE_URL;
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return SITE_URL;
  if (trimmed === "https://bidra.com.au") return SITE_URL;
  return trimmed;
}
