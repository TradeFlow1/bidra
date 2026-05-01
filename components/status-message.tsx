import type { ReactNode } from "react";

type StatusTone = "success" | "error" | "info" | "warning";

type Props = {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
};

const toneClass: Record<StatusTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-sky-200 bg-sky-50 text-sky-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
};

export default function StatusMessage({ tone, children, className }: Props) {
  const role = tone === "error" ? "alert" : "status";

  return (
    <div
      className={["rounded-xl border px-3 py-2 text-sm font-semibold break-words", toneClass[tone], className || ""].join(" ").trim()}
      role={role}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      {children}
    </div>
  );
}
