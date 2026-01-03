import React from "react";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={
        "inline-flex items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-black/5 px-3 h-7 text-[12px] font-extrabold leading-none text-[#0B0E11] " +
        (className || "")
      }
    >
      {children}
    </span>
  );
}
