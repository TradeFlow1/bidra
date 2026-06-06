import type { ReactNode } from "react";

type BidraAccountShellProps = {
  children: ReactNode;
  className?: string;
};

export function BidraAccountShell({ children, className = "" }: BidraAccountShellProps) {
  return (
    <main className={"bd-account-shell mx-auto w-full max-w-[1280px] px-4 py-4 pb-24 text-[#0F172A] sm:px-6 sm:py-6 lg:px-8 lg:pb-8 " + className}>
      {children}
    </main>
  );
}
