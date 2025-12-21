import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full min-h-[110px] rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200",
        className
      )}
      {...props}
    />
  );
}
