import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function BidraSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-11 w-full rounded-[18px] border border-[#D8E1F0] bg-white px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 disabled:cursor-not-allowed disabled:opacity-60", className)} {...props} />;
}