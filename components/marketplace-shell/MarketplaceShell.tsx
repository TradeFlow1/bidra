import type { ReactNode } from "react";
import Header from "./Header";
import MobileHeader from "./MobileHeader";
import BottomNav from "./BottomNav";
import type { ShellNavKey } from "./types";

type MarketplaceShellProps = {
  children: ReactNode;
  title: string;
  activeNav?: ShellNavKey;
};

export default function MarketplaceShell({ children, title, activeNav = "home" }: MarketplaceShellProps) {
  return (
    <div className="mk-shell">
      <Header active={activeNav} />
      <MobileHeader title={title} />
      <main className="mk-main">
        <div className="mk-content">{children}</div>
      </main>
      <BottomNav active={activeNav} />
    </div>
  );
}
