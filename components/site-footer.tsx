import Link from "next/link";
import BrandLogo from "./brand-logo";
const buyLinks = [["Browse", "/listings"], ["Buy now", "/listings?type=BUY_NOW"], ["Make an offer", "/listings?type=OFFERABLE"]];
const sellLinks = [["Sell", "/sell/new"], ["Pricing", "/pricing"]];
const supportLinks = [["Help", "/help"], ["Safety", "/support"], ["Contact", "/contact"]];
const legalLinks = [["Privacy", "/legal/privacy"], ["Terms", "/legal/terms"], ["Prohibited items", "/legal/prohibited-items"]];
function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return <div><h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#C4B5FD]">{title}</h2><div className="mt-5 grid gap-3">{links.map(([label, href]) => <Link key={href + label} href={href} className="text-sm font-semibold text-white/72 transition hover:text-white">{label}</Link>)}</div></div>;
}
export default function SiteFooter() {
  return (
    <footer className="bd-premium-footer hidden md:block">
      <div className="mx-auto w-full max-w-[1440px] px-8 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.85fr_0.85fr_0.85fr_0.85fr_1.25fr]">
          <div>
            <Link href="/" aria-label="Bidra home"><BrandLogo tone="light" /></Link>
            <p className="mt-5 max-w-xs text-sm font-semibold leading-7 text-white/70">Australia&apos;s premium peer-to-peer marketplace for serious local deals.</p>
            <div className="mt-6 grid gap-3 text-xs font-bold text-white/64">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Australian marketplace</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Secure messaging and clear handover records</div>
            </div>
          </div>
          <FooterColumn title="Browse" links={buyLinks} />
          <FooterColumn title="Sell" links={sellLinks} />
          <FooterColumn title="Support" links={supportLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#C4B5FD]">Trust first</h2>
            <p className="mt-5 text-sm font-semibold leading-7 text-white/70">Bidra is built around safer marketplace behaviour: clear listings, visible seller history, saved messages, reports and admin moderation.</p>
            <Link href="/sell/new" className="bd-btn mt-6 h-12 rounded-2xl bg-white px-6 text-[#2B1055] hover:bg-[#F5F3FF]">Sell your item</Link>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs font-semibold text-white/52 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Bidra. All rights reserved.</p>
          <p>Buyers and sellers arrange payment, pickup and handover directly.</p>
        </div>
      </div>
    </footer>
  );
}
