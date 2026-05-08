import React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "buy" | "offer" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bd-badge-neutral",
  buy: "bd-badge-buy",
  offer: "bd-badge-offer",
  success: "bd-badge-success",
  warning: "bd-badge-warning",
  danger: "bd-badge-danger",
  info: "bd-badge-info",
};

export function Badge({ className, children, tone = "neutral" }: { className?: string; children: React.ReactNode; tone?: BadgeTone }) {
  return (
    <span className={cn("bd-badge", toneClasses[tone], className)}>
      {children}
    </span>
  );
}
