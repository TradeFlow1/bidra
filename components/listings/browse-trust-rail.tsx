import Link from "next/link";
import { anchorButtonClassName } from "@/components/ui";

export function BrowseTrustRail() {
  return (
    <section className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="rounded-[26px] border border-[var(--bd-border)] bg-white p-4 shadow-[0_14px_42px_rgba(43,16,85,0.06)]">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--bd-purple)]">Buyer confidence</p>
        <div className="mt-3 grid gap-2 text-sm font-bold text-[var(--bd-muted)] sm:grid-cols-3">
          <span>Highest offer shown clearly</span>
          <span>Seller chooses when to accept</span>
          <span>Messages stay with the listing</span>
        </div>
      </div>

      <div className="grid gap-2 sm:flex lg:justify-end">
        <Link href="/wanted/new" className={anchorButtonClassName("secondary", "md")}>
          Post wanted ad
        </Link>
        <Link href="/sell/new" className={anchorButtonClassName("primary", "md")}>
          Sell your item
        </Link>
      </div>
    </section>
  );
}