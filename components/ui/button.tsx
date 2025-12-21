import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  );
}
