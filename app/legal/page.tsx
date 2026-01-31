import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Legal — Bidra" };

function Tile({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border bd-bd bg-white p-5 hover:shadow-sm transition-shadow"
    >
      <div className="text-sm font-extrabold bd-ink">{title}</div>
      <div className="mt-1 text-sm bd-ink2 leading-6">{desc}</div>
      <div className="mt-3 text-sm font-semibold bd-link">Open →</div>
    </Link>
  );
}

export default function LegalHubPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Legal</h1>
          <p className="bd-ink2 leading-7">
            Bidra is an Australian marketplace platform. Bidra is not the seller of items listed by users.
          </p>

          <div className="rounded-xl border bd-bd bg-white p-4 text-sm bd-ink2 leading-7">
            <strong className="bd-ink">Plain-English note:</strong> These pages explain how Bidra works, what’s allowed,
            and what users agree to when using the platform.
          </div>
        </header>

        <div className="grid gap-4">
          <Tile
            href="/legal/terms"
            title="Terms of Use"
            desc="Rules for using Bidra, including accounts, listings, messaging, and orders."
          />
          <Tile
            href="/legal/privacy"
            title="Privacy Policy"
            desc="How Bidra collects and uses information, and your privacy choices."
          />
          <Tile
            href="/legal/prohibited-items"
            title="Prohibited Items"
            desc="What can’t be listed. Attempted prohibited listings may be blocked."
          />
          <Tile
            href="/legal/fees"
            title="Fees"
            desc="What’s free and when fees may apply. No hidden fees."
          />
          <Tile
            href="/support"
            title="Support & Safety"
            desc="Safety guidance, scam awareness, and how to get help."
          />
        </div>

        <p className="text-xs bd-ink2 opacity-70">
          If something here is unclear, contact Support.
        </p>
      </div>
    </main>
  );
}
