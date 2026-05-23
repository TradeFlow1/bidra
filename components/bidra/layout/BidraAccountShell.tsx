import type { ReactNode } from "react";

type BidraAccountShellProps = {
  children: ReactNode;
  className?: string;
};

export function BidraAccountShell({ children, className = "" }: BidraAccountShellProps) {
  return (
    <main className={"mx-auto w-full max-w-[1320px] px-8 py-8 text-[#0F172A] " + className}>
      {children}
    </main>
  );
}
