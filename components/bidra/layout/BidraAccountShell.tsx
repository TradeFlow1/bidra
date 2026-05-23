import type { ReactNode } from "react";

type BidraAccountShellProps = {
  children: ReactNode;
  className?: string;
};

export function BidraAccountShell({ children, className = "" }: BidraAccountShellProps) {
  return (
    <main className={"bd-account-shell mx-auto w-full max-w-[1280px] px-6 py-8 text-[#0F172A] sm:px-8 lg:px-10 " + className}>
      {children}
    </main>
  );
}
