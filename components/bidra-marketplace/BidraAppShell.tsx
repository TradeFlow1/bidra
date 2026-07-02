import type { ReactNode } from "react";
import { BidraHeader } from "./BidraHeader";
import { BidraMobileNav } from "./BidraMobileNav";
import type { BidraNavKey } from "./types";

type BidraAppShellProps = {
  activeNav: BidraNavKey;
  pageLabel: string;
  children: ReactNode;
};

export function BidraAppShell({ activeNav, pageLabel, children }: BidraAppShellProps) {
  return (
    <div className="bidra-app-shell">
      <BidraHeader activeNav={activeNav} />
      <main className="bidra-main" aria-label={pageLabel}>
        {children}
      </main>
      <BidraMobileNav activeNav={activeNav} />
    </div>
  );
}
