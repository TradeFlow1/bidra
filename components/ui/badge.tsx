import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type BadgeTone = "neutral" | "offer" | "buy" | "success" | "warning" | "danger";

const toneClass: Record<BadgeTone, string> = {
  neutral: "border-[var(--bd-border)] bg-white text-[var(--bd-muted)]",
  offer: "border-purple-200 bg-[var(--bd-purple-soft)] text-[var(--bd-purple-dark)]",
  buy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700",
};

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn("inline-flex min-h-7 items-center justify-center rounded-full border px-3 text-[11px] font-black leading-none", toneClass[tone], className)} {...props} />;
}
