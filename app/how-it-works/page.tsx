import Link from "next/link";

function StepCard(props: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{props.step}</div>
      <h2 className="mt-2 text-xl font-extrabold tracking-tight bd-ink">{props.title}</h2>
      <div className="mt-3">{props.children}</div>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">How it works</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">How Bidra works</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Bidra is an Australian marketplace where people list items and connect directly. We are the platform only. We are not the seller, and we do not automatically award a winner.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/sell/new" className="bd-btn bd-btn-primary text-center">
                Create a listing
              </Link>
              <Link href="/support" className="bd-btn bd-btn-ghost text-center">
                Support and safety
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Platform only</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Users sell items</div>
            <div className="mt-1 text-sm text-neutral-600">Bidra is not the seller, auctioneer, escrow holder, or shipping provider.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Offer model</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Seller decides</div>
            <div className="mt-1 text-sm text-neutral-600">Timed offers do not create an automatic winner. The seller chooses whether to accept.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Current flow</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Simple marketplace handover</div>
            <div className="mt-1 text-sm text-neutral-600">After the item is sold, use messages to arrange pickup or postage, then leave feedback or report an issue if needed.</div>
          </div>
        </div>

        <StepCard step="Step 1" title="Create an account">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li><strong>18+ only:</strong> accounts are for adults. Under 18s can browse publicly but cannot transact or message.</li>
            <li>Set your <strong>location</strong> using suburb, state, and postcode so buyers see realistic pickup context.</li>
            <li>Keep your Dashboard account details accurate because it helps trust and reduces disputes.</li>
          </ul>
        </StepCard>

        <StepCard step="Step 2" title="List an item">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Add a clear title, honest description, condition, and photos that show the actual item.</li>
            <li>Choose the sale format that matches how you want to sell.</li>
          </ul>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <h3 className="text-base font-extrabold bd-ink">Buy Now (binding)</h3>
              <p className="mt-2 text-sm text-black/70">
                You set a fixed price. When a buyer clicks Buy Now, it becomes a binding sale. This is the fastest path to a sold item.
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-black/70 space-y-1">
                <li>Seller sets the price by listing with Buy Now enabled.</li>
                <li>Buyer commits to complete the purchase under Bidra&apos;s rules.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <h3 className="text-base font-extrabold bd-ink">Timed Offers (seller chooses)</h3>
              <p className="mt-2 text-sm text-black/70">
                Buyers place offers during the listing period. When the timer ends, the seller can choose what to do. A sale only forms if the seller explicitly accepts an offer.
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-black/70 space-y-1">
                <li>No automatic winner. Seller controls acceptance.</li>
                <li>Seller may decline or relist.</li>
              </ul>
            </div>
          </div>
        </StepCard>

        <StepCard step="Step 3" title="Messages and handover">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Use Messages to ask questions, arrange pickup or postage, and keep a clear record.</li>
            <li>For safety, keep communication respectful and clear. If anything feels off, report it.</li>
            <li>Never send ID photos or sensitive information you would not want exposed.</li>
          </ul>
        </StepCard>

        <StepCard step="Step 4" title="Completing the order">
          <p className="text-black/75">
            For Buy Now purchases, the item is sold immediately. Use messages to arrange pickup or postage, then leave feedback or report an issue if needed.
          </p>
          <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
            <li>There is no in-app payment, escrow, shipping, or pickup scheduling step in Bidra V1.</li>
            <li>After handover, leave feedback if available or report an issue if something went wrong.</li>
            <li>Leave feedback to help the community make better decisions.</li>
          </ul>
        </StepCard>

        <StepCard step="Step 5" title="Disputes, reporting, and safety">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>If a listing breaks rules, use <strong>Report</strong> on the listing or message thread.</li>
            <li>If something goes wrong, keep records such as screenshots, messages, and photos, then contact Support.</li>
            <li>Bidra may remove listings, restrict accounts, or investigate patterns of abuse to keep the marketplace safer.</li>
          </ul>
        </StepCard>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Important notes</h2>
          <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
            <li><strong>Bidra is the platform only.</strong> Items are sold by users, and we are not an auctioneer, escrow holder, shipping provider, or payment provider.</li>
            <li>Keep important details in Bidra messages for smoother resolution if something goes wrong.</li>
            <li>Fees, if any, are shown before you confirm actions. See <Link className="bd-link font-semibold" href="/legal/fees">Fees</Link>.</li>
            <li>Listings must follow our rules. Prohibited items are blocked. See <Link className="bd-link font-semibold" href="/legal/prohibited-items">Prohibited items</Link>.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">Want the fine print?</div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link className="bd-btn bd-btn-ghost text-center" href="/legal/terms">Terms</Link>
            <Link className="bd-btn bd-btn-ghost text-center" href="/legal/privacy">Privacy</Link>
            <Link className="bd-btn bd-btn-ghost text-center" href="/legal/fees">Fees</Link>
            <Link className="bd-btn bd-btn-ghost text-center" href="/legal/prohibited-items">Prohibited items</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
