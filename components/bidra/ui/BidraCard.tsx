import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function BidraCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[28px] border border-[#D8E1F0] bg-white shadow-sm", className)} {...props} />;
}