import Link from "next/link";
import BrandLogo from "./brand-logo";

const browseLinks = [
  ["Browse listings", "/listings"],
  ["Offers", "/listings?type=OFFERABLE"],
  ["Buy Now", "/listings?type=BUY_NOW"],
  ["Wanted", "/wanted"],
];

const sellerLinks = [
  ["Sell your item", "/sell/new"],
  ["Bulk listing", "/sell/bulk"],
  ["Pricing", "/pricing"],
  ["How it works", "/how-it-works"],
];

const accountLinks = [
  ["Dashboard", "/dashboard"],
  ["Messages", "/messages"],
  ["Orders", "/orders"],
  ["Watchlist", "/watchlist"],
];

const supportLinks = [
  ["Help", "/help"],
  ["Support", "/support"],
  ["Contact", "/contact"],
  ["Disputes", "/disputes"],
];

const legalLinks = [
  ["Privacy", "/legal/privacy"],
  ["Terms", "/legal/terms"],
  ["Prohibited items", "/legal/prohibited-items"],
  ["Fees", "/legal/fees"],
];

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div className="min-w-0">
      <h2 className="text-xs font-black uppercase tracking-[0.18em] text-[#C4B5FD]">{title}</h2>
      <div className="mt-4 grid gap-2.5">
        {links.map(([label, href]) => (
          <Link key={href + label} href={href} className="text-sm font-semibold text-white/72 transition hover:text-white">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-[radial-gradient(780px_320px_at_20%_0%,rgba(124,58,237,0.28),transparent_70%),linear-gradient(135deg,#10061F_0%,#150A28_56%,#21103C_100%)] text-white" data-site-footer>
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-12 sm:px-6 md:px-8 md:pb-12 lg:pt-16">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-7 lg:p-8">
          <div className="grid gap-9 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <Link href="/" aria-label="Bidra home" className="inline-flex">
                <BrandLogo tone="light" />
              </Link>

              <p className="mt-5 max-w-sm text-sm font-semibold leading-7 text-white/72">
                Australia&apos;s marketplace for buying, selling, Buy Now listings and highest-offer deals with seller acceptance built in.
              </p>

              <div className="mt-5 grid gap-2.5 text-xs font-bold text-white/70">
                <div className="rounded-2xl border border-white/10 bg-white/8 px-3.5 py-3">Australia-only marketplace</div>
                <div className="rounded-2xl border border-white/10 bg-white/8 px-3.5 py-3">Highest offer with seller choice</div>
                <div className="rounded-2xl border border-white/10 bg-white/8 px-3.5 py-3">Messages and order records kept together</div>
              </div>
            </div>

            <FooterColumn title="Browse" links={browseLinks} />
            <FooterColumn title="Sell" links={sellerLinks} />
            <FooterColumn title="Account" links={accountLinks} />
            <FooterColumn title="Support" links={supportLinks} />
            <FooterColumn title="Legal" links={legalLinks} />
          </div>

          <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 text-xs font-semibold text-white/56 sm:grid-cols-[1fr_auto] sm:items-center">
            <p>Â© 2026 Bidra. All rights reserved.</p>
            <p>Buyers and sellers confirm pickup, postage and payment details directly.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}