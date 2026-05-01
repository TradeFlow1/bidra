import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Legal & Policies — Bidra" };

function SectionTitle(props: { children: React.ReactNode }) {
  return <h2 className="text-lg font-extrabold tracking-tight bd-ink">{props.children}</h2>;
}

function LegalCard(props: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="text-sm font-extrabold bd-ink">{props.title}</div>
      <div className="mt-1 text-sm bd-ink2 leading-7">{props.desc}</div>
      <div className="mt-4">
        <Link className="bd-btn bd-btn-ghost text-center" href={props.href}>
          Open
        </Link>
      </div>
    </div>
  );
}

export default function LegalHubPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Legal and policies</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Legal hub</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                These pages explain how Bidra works, what is allowed, how fees and privacy are handled, and what risks remain with buyers and sellers. Bidra is a platform marketplace: items are listed and sold by users, and users remain responsible for payment, pickup, postage, and handover decisions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/how-it-works" className="bd-btn bd-btn-primary text-center">
                How it works
              </Link>
              <Link href="/support" className="bd-btn bd-btn-ghost text-center">
                Support and safety
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Start here</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">How it works</div>
            <div className="mt-1 text-sm text-neutral-600">Get the plain-language overview before reading detailed legal pages.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Core rules</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Terms and privacy</div>
            <div className="mt-1 text-sm text-neutral-600">Understand account rules, platform-only role, data handling, marketplace risk, and user responsibilities.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Safety</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Policies and restrictions</div>
            <div className="mt-1 text-sm text-neutral-600">Review prohibited items, fees, support guidance, and marketplace risk before trading.</div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">Quick start</div>
          <div className="mt-2 text-sm bd-ink2 leading-7">
            New here? Read{" "}
            <Link href="/how-it-works" className="bd-link font-semibold">How it works</Link>, then{" "}
            <Link href="/legal/terms" className="bd-link font-semibold">Terms</Link> and{" "}
            <Link href="/legal/privacy" className="bd-link font-semibold">Privacy</Link>.
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm space-y-6">
          <section className="space-y-3">
            <SectionTitle>Core documents</SectionTitle>
            <div className="grid gap-3 lg:grid-cols-2">
              <LegalCard
                title="Terms of Use"
                href="/legal/terms"
                desc="Rules for using Bidra, eligibility requirements, platform-only role, user responsibility, marketplace risk, and the two sale models: Buy Now and Timed Offers."
              />
              <LegalCard
                title="Privacy Policy"
                href="/legal/privacy"
                desc="What data we collect, why we collect it, who we share it with, how long we retain it, and your rights in Australia."
              />
              <LegalCard
                title="Fees"
                href="/legal/fees"
                desc="How fees work, when they apply, and examples of how totals are calculated."
              />
              <LegalCard
                title="Prohibited Items"
                href="/legal/prohibited-items"
                desc="Items that cannot be listed. Prohibited items are blocked at listing creation and repeated attempts may lead to restrictions."
              />
            </div>
          </section>

          <section className="space-y-2">
            <SectionTitle>Help and safety</SectionTitle>
            <p className="text-sm bd-ink2 leading-7">
              If you feel unsafe, stop engaging and report the listing or message thread. For emergencies, contact local authorities.
            </p>
            <div>
              <Link href="/support" className="bd-btn bd-btn-ghost text-center">
                Support and safety
              </Link>
            </div>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            Plain-language summaries for Australia. We may update policies over time, and the latest version is always posted here.
          </p>
        </div>
      </div>
    </main>
  );
}
