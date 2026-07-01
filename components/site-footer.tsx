import Link from "next/link";
import BrandLogo from "./brand-logo";

const buyLinks = [
  ["Browse all", "/listings"],
  ["Offers", "/listings?type=OFFERABLE"],
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
    <footer className="border-t border-[#E8E2EF] bg-[#FCFBFE] text-[#17131F]" data-site-footer>
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-10 sm:px-6 md:px-8 md:pb-12 lg:pt-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" aria-label="Bidra home" className="inline-flex">
              <BrandLogo tone="default" />
            </Link>
            <p className="mt-4 text-sm font-medium leading-7 text-[#6C6778]">
              A clearer way to browse, offer, message and complete local marketplace transactions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FooterColumn title="Browse" links={buyLinks} />
            <FooterColumn title="Sell" links={sellLinks} />
            <FooterColumn title="Support" links={supportLinks} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[#E8E2EF] pt-6 text-sm font-medium text-[#6C6778] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Bidra. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/privacy" className="transition hover:text-[#17131F]">Privacy</Link>
            <Link href="/legal/terms" className="transition hover:text-[#17131F]">Terms</Link>
            <Link href="/support" className="transition hover:text-[#17131F]">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
