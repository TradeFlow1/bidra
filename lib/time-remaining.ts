export function formatTimeRemaining(endsAt: Date | string | null | undefined, nowArg?: Date): string {
  if (!endsAt) return "";

  const end = endsAt instanceof Date ? endsAt : new Date(endsAt);
  if (Number.isNaN(end.getTime())) return "";

  const now = nowArg ?? new Date();
  const ms = end.getTime() - now.getTime();

  if (ms <= 0) return "Ended";

  const totalHours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  // Keep it simple + readable: days + hours only (as requested)
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}
