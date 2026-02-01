import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Legal & Policies — Bidra" };

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}
function Card({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border bd-bd bg-white p-5">
      <div className="text-sm font-extrabold bd-ink">{title}</div>
      <div className="mt-1 text-sm bd-ink2 leading-7">{desc}</div>
      <div className="mt-3">
        <Link className="bd-link font-semibold" href={href}>
          Open →
        </Link>
      </div>
    </div>
  );
}

export default function LegalHubPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Legal &amp; Policies</h1>
          <p className="bd-ink2 leading-7">
            These pages explain how Bidra works, what’s allowed, and how we handle privacy, fees, and safety.
            Bidra is a platform marketplace — items are listed and sold by users.
          </p>
          <div className="rounded-xl border bd-bd bg-white p-4 text-sm bd-ink2 leading-7">
            <strong className="bd-ink">Quick start:</strong>{" "}
            New here? Read{" "}
            <Link href="/how-it-works" className="bd-link font-semibold">How it works</Link>, then{" "}
            <Link href="/legal/terms" className="bd-link font-semibold">Terms</Link> and{" "}
            <Link href="/legal/privacy" className="bd-link font-semibold">Privacy</Link>.
          </div>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-6">
          <section className="space-y-3">
            <H2>Core documents</H2>
            <div className="grid gap-3">
              <Card
                title="Terms of Use"
                href="/legal/terms"
                desc="Rules for using Bidra, eligibility (18+), platform-only role, and the two sale models (Buy Now and Timed Offers)."
              />
              <Card
                title="Privacy Policy"
                href="/legal/privacy"
                desc="What data we collect, why we collect it, who we share it with, how long we retain it, and your rights in Australia."
              />
              <Card
                title="Fees"
                href="/legal/fees"
                desc="How fees work (if applicable), when they apply, and examples of how totals are calculated."
              />
              <Card
                title="Prohibited Items"
                href="/legal/prohibited-items"
                desc="Items that cannot be listed. Prohibited items are blocked at listing creation and repeated attempts may lead to restrictions."
              />
            </div>
          </section>

          <section className="space-y-2">
            <H2>Help & safety</H2>
            <p className="text-sm bd-ink2 leading-7">
              If you feel unsafe, stop engaging and report the listing or message thread.
              For emergencies, contact local authorities.
            </p>
            <p className="text-sm">
              <Link href="/support" className="bd-link font-semibold">Support &amp; Safety →</Link>
            </p>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            Plain-language summaries for Australia. We may update policies over time — the latest version is always posted here.
          </p>
        </div>
      </div>
    </main>
  );
}
