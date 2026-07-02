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
    <div>
      <Header active={activeNav} />
      <MobileHeader title={title} />
      <main>{children}</main>
      <BottomNav active={activeNav} />
    </div>
  );
}
