import type { ReactNode } from "react";

type BidraAccountShellProps = {
  children: ReactNode;
  className?: string;
};

export function BidraAccountShell({ children, className = "" }: BidraAccountShellProps) {
  return (
    <main className={"bd-logged-in-page mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 " + className}>
      {children}
    </main>
  );
}