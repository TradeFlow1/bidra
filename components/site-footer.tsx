import Link from "next/link";
import BrandLogo from "./brand-logo";
const buyLinks = [["Browse", "/listings"], ["Buy now", "/listings?type=BUY_NOW"], ["Make an offer", "/listings?type=OFFERABLE"]];
const sellLinks = [["Sell", "/sell/new"], ["Pricing", "/pricing"]];
const supportLinks = [["Help", "/help"], ["Safety", "/support"], ["Contact", "/contact"]];
const legalLinks = [["Privacy", "/legal/privacy"], ["Terms", "/legal/terms"], ["Prohibited items", "/legal/prohibited-items"]];
function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return <div className="min-w-0"><h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#C4B5FD]">{title}</h2><div className="mt-4 grid gap-2.5">{links.map(([label, href]) => <Link key={href + label} href={href} className="whitespace-nowrap text-sm font-medium text-white/72 transition hover:text-white">{label}</Link>)}</div></div>;
}
export default function SiteFooter() {
  return (
    <footer className="bd-premium-footer block">
      <div className="mx-auto w-full max-w-[1360px] px-4 pb-28 pt-11 sm:px-6 md:px-8 md:pb-12">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.75fr_0.75fr_0.75fr_0.85fr_1.2fr]">
          <div>
            <Link href="/" aria-label="Bidra home"><BrandLogo tone="light" /></Link>
            <p className="mt-4 max-w-xs text-sm font-medium leading-7 text-white/70">Australia&apos;s premium peer-to-peer marketplace for quality local listings.</p>
            <div className="mt-5 grid gap-2.5 text-xs font-semibold text-white/64">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">Australian marketplace</div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">Saved messages and clear item records</div>
            </div>
          </div>
          <FooterColumn title="Browse" links={buyLinks} />
          <FooterColumn title="Sell" links={sellLinks} />
          <FooterColumn title="Support" links={supportLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#C4B5FD]">Trust first</h2>
            <p className="mt-4 text-sm font-medium leading-7 text-white/70">Bidra keeps listings, seller history, saved messages, reports and moderation close to the marketplace experience.</p>
            <Link href="/sell/new" className="bd-btn mt-5 h-11 rounded-xl bg-white px-5 text-sm font-extrabold text-[#2B1055] hover:bg-[#F5F3FF]">Sell your item</Link>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs font-medium text-white/52 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Bidra. All rights reserved.</p>
          <p>Buyers and sellers confirm pickup, postage and payment details directly.</p>
        </div>
      </div>
    </footer>
  );
}
