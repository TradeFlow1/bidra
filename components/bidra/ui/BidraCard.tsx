import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function BidraCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[28px] border border-[#EDE9FE] bg-white shadow-[0_18px_50px_rgba(43,16,85,0.07)]", className)} {...props} />;
}
