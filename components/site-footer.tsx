import Link from "next/link";

const links: Array<{ href: string; label: string }> = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/support", label: "Support & Safety" },
  { href: "/contact", label: "Contact" },
  { href: "/feedback", label: "Feedback" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/prohibited-items", label: "Prohibited items" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t bg-white mt-8 bd-ink2">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="md:max-w-md">
            <div className="font-semibold text-gray-900">Bidra</div>
            <p className="mt-1 text-xs leading-5 text-gray-600">
              An Australian marketplace where people list items for sale or receive offers. Bidra is a platform only
              and is not the seller of items listed.
            </p>
          </div>

          <nav aria-label="Footer links" className="md:max-w-3xl">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="bd-link font-semibold leading-6">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[11px] leading-5 text-gray-500">
              Safety: meet in public, inspect items before paying, and keep communication on Bidra.
            </p>
          </nav>
        </div>
      </div>

      <div className="border-t py-2 text-center text-[11px] text-gray-500">
        © {new Date().getFullYear()} Bidra. All rights reserved.
      </div>
    </footer>
  );
}
