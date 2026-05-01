import Link from "next/link";

const marketplaceLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Browse listings" },
  { href: "/auth/register", label: "Create account" },
  { href: "/sell/new", label: "Start selling" },
];

const supportLinks = [
  { href: "/support", label: "Support & Safety" },
  { href: "/contact", label: "Contact" },
  { href: "/feedback", label: "Feedback" },
];

const legalLinks = [
  { href: "/legal", label: "Legal hub" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/fees", label: "Fees" },
  { href: "/legal/prohibited-items", label: "Prohibited items" },
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
    <footer className="mt-8 border-t border-[#D8E1F0] bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:py-6 lg:px-6 lg:py-8">
        <div className="grid gap-5 border-b border-[#E6EDF7] pb-4 sm:gap-6 sm:pb-6 md:grid-cols-[minmax(0,1.2fr)_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Bidra marketplace</div>
            <h2 className="mt-2 text-[1.55rem] font-extrabold tracking-tight text-[#0F172A] sm:text-[1.9rem]">Buy now. Make offers. Arrange handover.</h2>
            <p className="mt-2 text-sm leading-6 text-[#475569] sm:mt-3">
              Trust-first local marketplace for Buy Now sales and seller-accepted offers. Launch pricing: $0 buyer fees, $0 standard listing fees, and 0% seller success fee.
            </p>
          </div>

          <FooterLinkGroup title="Marketplace" links={marketplaceLinks} />
          <FooterLinkGroup title="Support" links={supportLinks} />
          <FooterLinkGroup title="Legal" links={legalLinks} />
        </div>

        <div className="flex flex-col gap-2 pt-3 text-xs text-[#64748B] sm:pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Bidra. All rights reserved.</p>
          <p>Read the legal hub before trading. Bidra is a platform marketplace; buyers and sellers remain responsible for payment, pickup, postage, and handover decisions.</p>
        </div>
      </div>
    </footer>
  );
}
