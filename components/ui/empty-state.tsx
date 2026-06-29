import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export function EmptyState({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[24px] border border-dashed border-[var(--bd-border)] bg-white px-5 py-10 text-center shadow-[0_14px_40px_rgba(18,7,36,0.06)]", className)} {...props} />;
}
