import Link from "next/link";

function PricingCard(props: {
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="text-sm font-extrabold bd-ink">{props.title}</div>
      <div className="mt-2 text-sm bd-ink2 leading-7">{props.desc}</div>
      {props.children ? <div className="mt-3">{props.children}</div> : null}
    </div>
  );
}

export default function PricingPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Pricing</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Simple, visible pricing</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Bidra keeps pricing straightforward. Fees may change over time, but we will always show costs clearly in-product before you commit.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/legal/fees" className="bd-btn bd-btn-primary text-center">
                View fees policy
              </Link>
              <Link href="/how-it-works" className="bd-btn bd-btn-ghost text-center">
                How it works
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Source of truth</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">In-app pricing</div>
            <div className="mt-1 text-sm text-neutral-600">The price or fee shown in Bidra at the moment you act is the source of truth.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Simplicity</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">No hidden surprises</div>
            <div className="mt-1 text-sm text-neutral-600">You should see costs before confirming key actions, not after the fact.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Current model</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Local marketplace flow</div>
            <div className="mt-1 text-sm text-neutral-600">Bidra supports listings, offers, orders, and local pickup coordination inside the product.</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <PricingCard
            title="Browse"
            desc="Browsing listings is free. You can explore the marketplace, compare listings, and understand current local supply without an upfront browsing cost."
          />

          <PricingCard
            title="Sell"
            desc="Creating a listing is generally free unless the product explicitly shows a paid option or fee at the time you list or complete a relevant flow."
          >
            <Link href="/legal/fees" className="bd-btn bd-btn-ghost text-center">
              Fees policy
            </Link>
          </PricingCard>

          <PricingCard
            title="Buy"
            desc="Buyers follow the in-app marketplace flow. Pickup coordination and order progress are shown inside Bidra so expectations stay clearer."
          />
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">How fees work</h2>
          <div className="mt-3 space-y-3 text-sm bd-ink2 leading-7">
            <p>
              Bidra may apply listing, promotional, seller success, or order-related fees depending on the product flow. Not every action has a fee.
            </p>
            <p>
              The fee shown in the Bidra UI at the time of action is the source of truth. That matters more than any older example or summary page.
            </p>
            <p>
              For the latest rules and examples, read the <Link href="/legal/fees" className="bd-link font-semibold">Fees policy</Link>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/listings" className="bd-btn bd-btn-primary text-center">
            Browse listings
          </Link>
          <Link href="/sell" className="bd-btn bd-btn-ghost text-center">
            Start selling
          </Link>
        </div>
      </div>
    </main>
  );
}
