import Link from "next/link";

const footerGroups = [
  {
    title: "Marketplace",
    links: [
      { href: "/", label: "Home" },
      { href: "/listings", label: "Browse listings" },
      { href: "/auth/register", label: "Create account" },
      { href: "/sell", label: "Sell" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/support", label: "Support" },
      { href: "/contact", label: "Contact" },
      { href: "/feedback", label: "Feedback" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal", label: "Legal hub" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/fees", label: "Fees" },
      { href: "/legal/prohibited-items", label: "Prohibited items" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-[#D8E1F0] bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-7 md:hidden">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Bidra Marketplace</div>
        <div className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-[#0F172A]">
          Buy now. Make offers.
        </div>
        <p className="mt-2 text-sm leading-6 text-[#475569]">
          Browse listings, buy now, and arrange handover directly with buyers or sellers.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <div className="text-sm font-extrabold text-[#0F172A]">{group.title}</div>
              <div className="mt-2 grid gap-2">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-sm font-semibold text-[#2563EB] hover:underline">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-[#D8E1F0] pt-4 text-xs leading-5 text-[#64748B]">
          <div>&copy; 2026 Bidra. All rights reserved.</div>
          <div className="mt-1">Bidra is a marketplace platform. Buyers and sellers arrange payment, pickup, postage, and handover details.</div>
        </div>
      </div>

      <div className="mx-auto hidden w-full max-w-6xl px-4 py-10 md:block">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Bidra Marketplace</div>
            <div className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#0F172A]">
              Buy now. Make offers. Arrange handover.
            </div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#475569]">
              Browse listings, Buy Now, and make offers. No buyer or standard listing fees.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <div className="text-sm font-extrabold text-[#0F172A]">{group.title}</div>
              <div className="mt-3 grid gap-2">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-sm font-semibold text-[#2563EB] hover:underline">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#D8E1F0] pt-5 text-xs text-[#64748B] md:flex-row md:items-center md:justify-between">
          <div>&copy; 2026 Bidra. All rights reserved.</div>
          <div>Bidra is a marketplace platform. Buyers and sellers arrange payment, pickup, postage, and handover details.</div>
        </div>
      </div>
    </footer>
  );
}