export function formatAud(cents: number | null | undefined): string {
  const v = typeof cents === "number" && Number.isFinite(cents) ? cents : 0;
  const dollars = v / 100;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(dollars);
}
