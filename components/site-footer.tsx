import Link from "next/link";
import BrandLogo from "./brand-logo";

const buyLinks = [
  ["Browse all", "/listings"],
  ["Auctions", "/listings?type=OFFERABLE"],
  ["Buy Now", "/listings?type=BUY_NOW"],
  ["Popular searches", "/categories"],
];

const sellLinks = [
  ["Sell your item", "/sell/new"],
  ["How it works", "/how-it-works"],
  ["Pricing", "/pricing"],
  ["Business sellers", "/sell/bulk"],
];

const supportLinks = [
  ["Help centre", "/help"],
  ["Safety tips", "/support"],
  ["Contact us", "/contact"],
  ["Community rules", "/legal/prohibited-items"],
];

const companyLinks = [
  ["About Bidra", "/about"],
  ["Wanted", "/wanted"],
  ["Terms", "/legal/terms"],
  ["Privacy policy", "/legal/privacy"],
];

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div className="min-w-0">
      <h2 className="text-sm font-black text-white">{title}</h2>
      <div className="mt-4 grid gap-2.5">
        {links.map(([label, href]) => (
          <Link key={href + label} href={href} className="text-sm font-semibold text-white/66 transition hover:text-white">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SocialDot({ label }: { label: string }) {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xs font-black text-white/82 ring-1 ring-white/12">
      {label}
    </span>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-[linear-gradient(135deg,#10061F_0%,#170A2E_58%,#21103C_100%)] text-white" data-site-footer>
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-12 sm:px-6 md:px-8 md:pb-12 lg:pt-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.8fr_1.1fr]">
          <div>
            <Link href="/" aria-label="Bidra home" className="inline-flex">
              <BrandLogo tone="light" />
            </Link>

            <p className="mt-5 max-w-xs text-sm font-semibold leading-7 text-white/70">
              Australia&apos;s trusted marketplace. Premium listings, serious buyers, and secure handovers.
            </p>
          </div>

          <FooterColumn title="Buy" links={buyLinks} />
          <FooterColumn title="Sell" links={sellLinks} />
          <FooterColumn title="Support" links={supportLinks} />
          <FooterColumn title="Company" links={companyLinks} />

          <div className="rounded-[24px] border border-white/12 bg-white/8 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.20)]">
            <h2 className="text-sm font-black text-white">Stay in the loop</h2>
            <p className="mt-2 text-xs font-semibold leading-5 text-white/62">Fresh deals and new listings straight to your inbox.</p>
            <form className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
              <label className="sr-only" htmlFor="footer-email">Email address</label>
              <input id="footer-email" type="email" placeholder="Enter your email" className="h-11 rounded-[14px] border border-white/12 bg-white px-3 text-sm font-semibold text-[#120724] outline-none placeholder:text-[#8B7A98]" />
              <button type="button" className="h-11 rounded-[14px] bg-[#7C3AED] px-4 text-sm font-black text-white transition hover:bg-[#6D28D9]">Subscribe</button>
            </form>
            <div className="mt-5 flex gap-2">
              <SocialDot label="f" />
              <SocialDot label="ig" />
              <SocialDot label="yt" />
              <SocialDot label="x" />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 text-xs font-semibold text-white/52 sm:grid-cols-[1fr_auto] sm:items-center">
          <p>© 2026 Bidra. All rights reserved.</p>
          <p>Buyers and sellers confirm pickup, postage and payment details directly.</p>
        </div>
      </div>
    </footer>
  );
}
