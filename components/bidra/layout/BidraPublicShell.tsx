import type { ReactNode } from "react";
import { BidraDesktopFooter } from "./BidraDesktopFooter";
import { BidraDesktopHeader } from "./BidraDesktopHeader";
import { BidraMobileBottomNav } from "./BidraMobileBottomNav";
import { BidraMobileHeader } from "./BidraMobileHeader";

export function BidraPublicShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <div className="hidden md:block"><BidraDesktopHeader /></div>
      <BidraMobileHeader />
      <main className={"mx-auto w-full max-w-7xl px-4 py-4 pb-24 md:px-6 md:py-8 md:pb-10 lg:px-8 " + className}>{children}</main>
      <div className="hidden md:block"><BidraDesktopFooter /></div>
      <BidraMobileBottomNav />
    </div>
  );
}