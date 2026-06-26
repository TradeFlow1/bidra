import type { ReactNode } from "react";

type BidraAccountShellProps = {
  children: ReactNode;
  className?: string;
};

export function BidraAccountShell({ children, className = "" }: BidraAccountShellProps) {
  return (
    <main className={"bd-account-shell bg-[#FBF9FF] px-4 py-4 pb-24 text-[#120724] sm:px-6 sm:py-6 lg:px-8 lg:pb-8 " + className}>
      <div className="mx-auto w-full max-w-[1280px]">
        {children}
      </div>
    </main>
  );
}
