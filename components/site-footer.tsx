import Link from "next/link";

const marketplaceLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Browse listings" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/sell", label: "Sell" },
];

const supportLinks = [
  { href: "/support", label: "Support & Safety" },
  { href: "/contact", label: "Contact" },
  { href: "/feedback", label: "Feedback" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/prohibited-items", label: "Prohibited items" },
];

function FooterPillLinks({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2 md:block md:space-y-2 md:gap-0">
        {links.map(function (link) {
          return (
            <Link
              key={link.href + ":" + link.label}
              href={link.href}
              className="inline-flex rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#475569] transition hover:bg-white hover:text-[#0F172A] md:block md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0"
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-[#D8E1F0] bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <div className="grid gap-5 border-b border-[#E6EDF7] pb-5 md:grid-cols-[minmax(0,1.15fr)_1fr_1fr_1fr] md:gap-8 md:pb-6">
          <div className="max-w-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Bidra marketplace</div>
            <h2 className="mt-2 text-[1.55rem] font-extrabold tracking-tight text-[#0F172A] md:text-[1.8rem]">Buy now. Make offers.</h2>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              Trust-first marketplace for straightforward buying and highest-offer listings.
            </p>
          </div>

          <FooterPillLinks title="Marketplace" links={marketplaceLinks} />
          <FooterPillLinks title="Support" links={supportLinks} />
          <FooterPillLinks title="Legal" links={legalLinks} />
        </div>

        <div className="flex flex-col gap-1.5 pt-4 text-xs text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Bidra. All rights reserved.</p>
          <p>Buy Now and highest-offer marketplace.</p>
        </div>
      </div>
    </footer>
  );
}