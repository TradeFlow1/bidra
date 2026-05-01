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

export default function FeesPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Fees</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Fees on Bidra</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Bidra is a marketplace platform. Fees help cover platform operations, support, safety tooling, and ongoing improvements. Any applicable fees are shown in-app before you confirm actions, and Bidra does not control off-platform payment, refunds, pickup, postage, or handover arrangements.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/legal" className="bd-btn bd-btn-primary text-center">
                Legal hub
              </Link>
              <Link href="/legal/terms" className="bd-btn bd-btn-ghost text-center">
                Terms
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Source of truth</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">In-app fee display</div>
            <div className="mt-1 text-sm text-neutral-600">The fee shown in the Bidra UI at the time of action is the source of truth; off-platform payment or refund arrangements are user responsibility.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Listings</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Usually free</div>
            <div className="mt-1 text-sm text-neutral-600">Listing is generally free unless a paid option is explicitly shown in-product.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Sales</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Fee rules may vary</div>
            <div className="mt-1 text-sm text-neutral-600">Buy Now and Timed Offers can have different fee handling depending on the flow.</div>
          </div>
        </div>

        <SectionCard title="Listing fees">
          <p className="text-black/75 leading-7">
            Creating a listing is generally free unless the product experience explicitly shows a paid option at the time you list.
          </p>
        </SectionCard>

        <SectionCard title="Success fees">
          <p className="text-black/75 leading-7">
            For completed <strong>Buy Now</strong> sales, Bidra may charge a seller success fee. <strong>The fee shown in the Bidra UI at the time of sale is the source of truth.</strong>
          </p>
          <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
            <li>Typical structure: a small percentage of the sale price, for example 7%.</li>
            <li>Fees, if any, are displayed before confirmation and are recorded on the order as part of the sold-item record.</li>
            <li>Timed Offers may have different fee rules depending on how the sale is completed.</li>
          </ul>
          <p className="mt-3 text-sm text-black/60">
            Note: fee structures can evolve over time as Bidra adds new features. We will always display fees clearly in-app.
          </p>
        </SectionCard>

        <SectionCard title="Order handling">
          <p className="text-black/75 leading-7">
            Bidra may apply listing, promotion, or order-related fees as described in-product. Orders are sold-item records, and buyers and sellers use Messages to arrange payment, refunds, pickup, postage, and handover. Bidra does not hold pooled customer funds or act as escrow.
          </p>
        </SectionCard>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">See also</div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link className="bd-btn bd-btn-ghost text-center" href="/legal/terms">Terms</Link>
            <Link className="bd-btn bd-btn-ghost text-center" href="/how-it-works">How it works</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
