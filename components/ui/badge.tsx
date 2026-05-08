import React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("bd-badge", className)}>{children}</span>;
}
