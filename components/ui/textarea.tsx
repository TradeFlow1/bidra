import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn("bd-input min-h-[130px] resize-y leading-relaxed", className)}
      {...props}
    />
  );
}
