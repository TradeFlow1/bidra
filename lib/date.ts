export function formatAuDateTime(input: Date | string | number | null | undefined) {
  if (!input) return ""
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return ""

  // Force AU-style date + Sydney timezone regardless of server locale/timezone
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d)
}
