import Link from "next/link";

function SectionCard(props: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-extrabold tracking-tight bd-ink">{props.title}</h2>
      <div className="mt-3">{props.children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Terms</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Terms of use</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                These Terms govern your use of Bidra. By accessing or using Bidra, you agree to these Terms. Bidra is a marketplace platform only. We are not the seller of items, not a payment provider, and not an auctioneer.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/legal" className="bd-btn bd-btn-primary text-center">
                Legal hub
              </Link>
              <Link href="/support" className="bd-btn bd-btn-ghost text-center">
                Support and safety
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Eligibility</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">18+ accounts only</div>
            <div className="mt-1 text-sm text-neutral-600">Under 18s may browse publicly but cannot create accounts or transact.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Marketplace role</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Platform only</div>
            <div className="mt-1 text-sm text-neutral-600">Bidra provides marketplace tools, but users remain responsible for their decisions and actions.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Orders</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">No funds held</div>
            <div className="mt-1 text-sm text-neutral-600">Bidra shows order flow in-app, but does not hold funds and does not guarantee outcomes.</div>
          </div>
        </div>

        <SectionCard title="1) Eligibility and accounts">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li><strong>18+ accounts only.</strong> Under 18s may browse publicly but may not create accounts, list items, place offers, message, or transact.</li>
            <li>You must provide accurate information and keep your account details reasonably current, including your location.</li>
            <li>You are responsible for keeping your login details secure and for all activity on your account.</li>
            <li>We may restrict or suspend accounts to protect the marketplace, comply with law, or investigate abuse.</li>
          </ul>
        </SectionCard>

        <SectionCard title="2) Your responsibilities">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>You must comply with applicable Australian laws and not use Bidra for unlawful activity.</li>
            <li>You must not harass, threaten, scam, impersonate, or spam other users.</li>
            <li>You must not attempt to bypass safety measures or misuse reports, feedback, or messaging tools.</li>
            <li>You must not upload viruses, automated scraping, or attempt to interfere with site operations.</li>
          </ul>
        </SectionCard>

        <SectionCard title="3) Listings and content">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Listings must be accurate, lawful, and not misleading, including title, description, photos, condition, and location context.</li>
            <li>You must have the right to sell the item and it must not be stolen, counterfeit, or unlawfully supplied.</li>
            <li><strong>Prohibited items are not allowed.</strong> They may be removed without notice. See <Link className="bd-link font-semibold" href="/legal/prohibited-items">Prohibited items</Link>.</li>
            <li>We may remove listings or restrict accounts to protect users, reduce fraud, and maintain trust.</li>
          </ul>
        </SectionCard>

        <SectionCard title="4) Sale formats">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <h3 className="text-base font-extrabold bd-ink">Buy Now (binding sale)</h3>
              <ul className="mt-2 list-disc pl-5 text-black/75 space-y-1">
                <li>When a seller enables Buy Now, they pre-authorise an immediate sale at the displayed price.</li>
                <li>When a buyer clicks Buy Now, the buyer commits to complete the order and follow the scheduled pickup flow.</li>
                <li>Buy Now is designed for faster completion and clearer expectations.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <h3 className="text-base font-extrabold bd-ink">Timed Offers (seller acceptance required)</h3>
              <ul className="mt-2 list-disc pl-5 text-black/75 space-y-1">
                <li>Offers are expressions of interest during the listing period.</li>
                <li>When the timer ends, there is no automatic winner and no automatic sale.</li>
                <li>A sale only forms if the seller explicitly accepts an offer, including the highest offer.</li>
              </ul>
            </div>
          </div>

          <p className="mt-3 text-sm text-black/60">
            Bidra provides tools for listing, offers, messaging, and order status. Buyers and sellers are responsible for their decisions and actions.
          </p>
        </SectionCard>

        <SectionCard title="5) Orders, pickup scheduling, and completion">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>When an order exists, it represents a binding commitment under the relevant flow, such as Buy Now.</li>
            <li>Bidra shows order status, pickup scheduling, and completion steps in-app, but <strong>Bidra does not hold funds</strong> and <strong>does not guarantee outcomes</strong>.</li>
            <li>Buyers and sellers should follow the in-app order flow, complete pickup carefully, and keep records such as messages and photos.</li>
            <li>Disputes are usually resolved between buyer and seller. Bidra may take platform actions, including restrictions, where misuse or fraud is detected.</li>
          </ul>
        </SectionCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="6) Messaging">
            <p className="text-black/75 leading-7">
              Messages are provided to coordinate listings and orders. You must not harass, threaten, spam, or send illegal content. We may restrict messaging or remove content where abuse, fraud, or safety risk is suspected.
            </p>
          </SectionCard>

          <SectionCard title="7) Reporting, enforcement, and integrity">
            <ul className="list-disc pl-5 text-black/75 space-y-2">
              <li>Use Report on listings and message threads to flag rule-breaking behaviour or content.</li>
              <li>We may remove content, suspend listings, restrict accounts, or investigate suspicious patterns to help keep the marketplace safer.</li>
              <li>We may log safety and enforcement events for audit and fraud prevention purposes.</li>
            </ul>
          </SectionCard>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="8) Liability and service availability">
            <p className="text-black/75 leading-7">
              Bidra is provided "as is" to the extent permitted by law. We aim to keep the service reliable, but outages and errors can occur. Nothing in these Terms limits rights you may have under Australian Consumer Law where applicable.
            </p>
          </SectionCard>

          <SectionCard title="9) Changes to these Terms">
            <p className="text-black/75 leading-7">
              We may update these Terms from time to time. If changes are material, we will take reasonable steps to notify users.
            </p>
          </SectionCard>
        </div>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">See also</div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link className="bd-btn bd-btn-ghost text-center" href="/legal/privacy">Privacy</Link>
            <Link className="bd-btn bd-btn-ghost text-center" href="/legal/fees">Fees</Link>
            <Link className="bd-btn bd-btn-ghost text-center" href="/support">Support and safety</Link>
            <Link className="bd-btn bd-btn-ghost text-center" href="/how-it-works">How it works</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
