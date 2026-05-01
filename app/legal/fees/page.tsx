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
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Bidra fees</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Current launch pricing is simple: creating an account is free, browsing is free, messaging is free, creating a standard listing is free, placing an offer is free, and using Buy Now is free for buyers. The current seller success fee is 0% during launch.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/legal" className="bd-btn bd-btn-primary text-center">
                Legal hub
              </Link>
              <Link href="/support" className="bd-btn bd-btn-ghost text-center">
                Support
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Buyer fees</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">$0</div>
            <div className="mt-1 text-sm text-neutral-600">Buyers do not pay Bidra a fee to browse, watch, message, make offers, or use Buy Now during launch.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Seller listing fees</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">$0</div>
            <div className="mt-1 text-sm text-neutral-600">Sellers can create standard listings for free during launch.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Seller success fee</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">0%</div>
            <div className="mt-1 text-sm text-neutral-600">Bidra does not charge a seller success fee during launch.</div>
          </div>
        </div>

        <SectionCard title="Current launch fee model">
          <ul className="list-disc space-y-2 pl-5 text-black/75">
            <li><strong>Account:</strong> $0 to create and use a Bidra account.</li>
            <li><strong>Browse, watch, and message:</strong> $0 for buyers and sellers.</li>
            <li><strong>Standard listings:</strong> $0 for sellers during launch.</li>
            <li><strong>Offers:</strong> $0 to place or accept an offer during launch.</li>
            <li><strong>Buy Now:</strong> $0 Bidra buyer fee during launch.</li>
            <li><strong>Seller success fee:</strong> 0% during launch.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Payment and handover">
          <p className="text-black/75 leading-7">
            Bidra creates listing, offer, messaging, and sold-item records. Buyers and sellers arrange payment, refunds, pickup, postage, and handover directly with each other in Messages. Bidra does not hold pooled customer funds, process marketplace payments, or act as escrow.
          </p>
        </SectionCard>

        <SectionCard title="If fees change later">
          <p className="text-black/75 leading-7">
            If Bidra introduces paid upgrades, listing promotion, payment processing, or seller success fees later, the current fee will be shown before the user confirms that paid action. This page is the public source of truth for the current fee model.
          </p>
        </SectionCard>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">See also</div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link className="bd-btn bd-btn-ghost text-center" href="/legal/terms">Terms</Link>
            <Link className="bd-btn bd-btn-ghost text-center" href="/support">Support</Link>
            <Link className="bd-btn bd-btn-ghost text-center" href="/how-it-works">How it works</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
