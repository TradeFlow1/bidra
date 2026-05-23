import Link from "next/link";
import BrandLogo from "./brand-logo";

const marketplaceLinks = [
  ["Home", "/"],
  ["Buy now", "/listings?type=BUY_NOW"],
  ["Make an offer", "/listings?type=OFFERABLE"],
  ["Browse categories", "/listings"],
  ["Sell an item", "/sell/new"],
];

const supportLinks = [
  ["Help centre", "/help"],
  ["Contact us", "/contact"],
  ["Safety tips", "/help"],
  ["Community guidelines", "/legal/prohibited-items"],
];

const legalLinks = [
  ["Terms of use", "/legal/terms"],
  ["Privacy policy", "/legal/privacy"],
  ["Fees", "/legal/fees"],
  ["Prohibited items", "/legal/prohibited-items"],
];

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h2 className="text-base font-black text-[#0F172A]">{title}</h2>
      <div className="mt-5 grid gap-3">
        {links.map(([label, href]) => (
          <Link key={href + label} href={href} className="text-sm font-semibold text-[#4F46E5] hover:text-[#4338CA]">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white">
      <div className="mx-auto w-full max-w-[1320px] px-8 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.9fr_0.9fr_0.9fr_1.25fr]">
          <div>
            <Link href="/" className="flex h-14 w-44 items-center" aria-label="Bidra home">
              <BrandLogo className="h-full w-auto max-w-full" />
            </Link>
            <p className="mt-5 max-w-xs text-sm font-semibold leading-7 text-[#475569]">
              Australia&apos;s local marketplace. Buy, sell and discover with ease.
            </p>
            <div className="mt-6 flex gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#EEF2FF] text-sm font-black text-[#4F46E5]">f</span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#EEF2FF] text-sm font-black text-[#4F46E5]">ig</span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#EEF2FF] text-sm font-black text-[#4F46E5]">x</span>
            </div>
          </div>

          <FooterColumn title="Marketplace" links={marketplaceLinks} />
          <FooterColumn title="Support" links={supportLinks} />
          <FooterColumn title="Legal" links={legalLinks} />

          <div>
            <h2 className="text-base font-black text-[#0F172A]">Stay in the loop</h2>
            <p className="mt-5 max-w-xs text-sm font-semibold leading-7 text-[#475569]">
              Get tips, new features and local marketplace updates.
            </p>
            <form className="mt-5 grid gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-12 rounded-2xl border border-[#D8E1F0] bg-white px-4 text-sm font-semibold text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#C7D2FE]"
              />
              <button type="button" className="bd-btn bd-btn-primary h-12 rounded-2xl px-6">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#E2E8F0] pt-7 text-xs font-semibold text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Bidra. All rights reserved.</p>
          <p>Bidra is a marketplace platform. Buyers and sellers arrange payment, pickup and handover directly.</p>
        </div>
      </div>
    </footer>
  );
}