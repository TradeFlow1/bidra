import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BidraBadgeTone = "default" | "success" | "warning" | "danger" | "info";

const toneClass: Record<BidraBadgeTone, string> = {
  default: "border-[#D8E1F0] bg-[#F8FAFC] text-[#334155]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

export function BidraBadge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BidraBadgeTone }) {
  const tone = props.tone || "default";
  const cleanProps = { ...props };
  delete cleanProps.tone;
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold", toneClass[tone], className)} {...cleanProps}>{children}</span>;
}