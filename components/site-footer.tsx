import Link from "next/link";

const marketplaceLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Browse listings" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/sell", label: "Sell" },
];

const supportLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/support", label: "Support & Safety" },
  { href: "/contact", label: "Contact" },
  { href: "/feedback", label: "Feedback" },
];

const legalLinks = [
  { href: "/legal", label: "Legal" },
  { href: "/legal/fees", label: "Fees" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/prohibited-items", label: "Prohibited items" },
];

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map(function (link) {
          return (
            <li key={link.href + ":" + link.label}>
              <Link href={link.href} className="text-sm text-[#475569] transition hover:text-[#0F172A]">
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-[#D8E1F0] bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
        <div className="grid gap-8 border-b border-[#E6EDF7] pb-8 md:grid-cols-[minmax(0,1.2fr)_1fr_1fr_1fr]">
          <div className="max-w-md">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Bidra marketplace</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0F172A]">Buy now. Make offers. Trade with more confidence.</h2>
            <p className="mt-3 text-sm leading-6 text-[#475569]">
              Bidra is an Australian marketplace built for straightforward browsing, clear pricing, highest-offer listings, and trust-first trading.
            </p>
            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              Meet in public where possible, inspect items before paying, and keep communication on Bidra.
            </p>
          </div>

          <FooterLinkGroup title="Marketplace" links={marketplaceLinks} />
          <FooterLinkGroup title="Support" links={supportLinks} />
          <FooterLinkGroup title="Legal" links={legalLinks} />
        </div>

        <div className="flex flex-col gap-2 pt-5 text-xs text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Bidra. All rights reserved.</p>
          <p>Trust-first marketplace for Buy Now and highest-offer listings.</p>
        </div>
      </div>
    </footer>
  );
}