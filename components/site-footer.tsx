import Link from "next/link";
import BrandLogo from "./brand-logo";

const footerGroups = [
  {
    title: "Marketplace",
    links: [
      { href: "/", label: "Home" },
      { href: "/listings", label: "Buy now" },
      { href: "/listings?type=OFFERABLE", label: "Make an offer" },
      { href: "/sell/new", label: "Sell an item" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/support", label: "Help centre" },
      { href: "/contact", label: "Contact us" },
      { href: "/feedback", label: "Feedback" },
      { href: "/legal/prohibited-items", label: "Community guidelines" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of use" },
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/fees", label: "Fees" },
      { href: "/legal/prohibited-items", label: "Prohibited items" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer data-site-footer className="hidden-on-home-mobile" data-footer-base="mt-10 border-t border-[#D8E6F8] bg-[#F7FAFF] pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-11">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_2fr_1fr] lg:items-start">
          <div>
            <Link href="/" className="flex h-10 w-36 items-center" aria-label="Bidra home">
              <BrandLogo className="h-9 w-auto" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#526173]">
              Australia&apos;s local marketplace. Buy now. Make offers. Arrange handover.
            </p>
            <div className="mt-4 flex gap-2 text-xs font-extrabold text-[#607089]">
              <span className="bd-pill">Buy now</span>
              <span className="bd-pill">Offers</span>
              <span className="bd-pill">Local</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <div className="text-sm font-extrabold text-[#0F172A]">{group.title}</div>
                <div className="mt-3 grid gap-2.5">
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href} className="text-sm font-semibold text-[#526173] transition hover:text-[#0E7490]">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[#E6EDF7] pt-5 text-xs text-[#607089] md:flex-row md:items-center md:justify-between">
          <div>&copy; 2026 Bidra. All rights reserved.</div>
          <div>Bidra is a marketplace platform. Buyers and sellers arrange payment, pickup and handover directly.</div>
        </div>
      </div>
    </footer>
  );
}





