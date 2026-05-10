import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

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
      <div className="mx-auto w-full mb-4 w-full max-w-6xl px-4"><BackButton href="/" label="Back to home" /></div>
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">How it works</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">How Bidra works</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                List items, buy now, make offers, and arrange pickup or postage in messages.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/sell/new" className="bd-btn bd-btn-primary text-center">
                Sell
              </Link>
              <Link href="/listings" className="bd-btn bd-btn-ghost text-center">
                Browse listings
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Platform only</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Users sell items</div>
            <div className="mt-1 text-sm text-neutral-600">Users sell items directly.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Offer model</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Seller decides</div>
            <div className="mt-1 text-sm text-neutral-600">Timed offers do not create an automatic winner. The seller chooses whether to accept.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Current flow</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Simple marketplace handover</div>
            <div className="mt-1 text-sm text-neutral-600">Use messages to arrange pickup or postage after sale.</div>
          </div>
        </div>

        <StepCard step="Step 1" title="Set up your marketplace account">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li><strong>18+ only:</strong> accounts are for adults. Under 18s can browse publicly but cannot transact or message.</li>
            <li>Set your <strong>location</strong> using suburb, state, and postcode so buyers see realistic pickup context.</li>
            
          </ul>
        </StepCard>

        <StepCard step="Step 2" title="List an item with buyer-ready details">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Add a clear title, honest description, condition, and photos that show the actual item.</li>
            <li>Choose Buy Now for a fixed price or Timed Offers to review buyer interest.</li>
          </ul>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <h3 className="text-base font-extrabold bd-ink">Buy Now (binding)</h3>
              <p className="mt-2 text-sm text-black/70">
                You set a fixed price. When a buyer clicks Buy Now, it becomes a binding sale. 
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-black/70 space-y-1">
                <li>Seller sets the price by listing with Buy Now enabled.</li>
                <li>Buyer arranges handover in messages.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <h3 className="text-base font-extrabold bd-ink">Timed Offers (seller chooses)</h3>
              <p className="mt-2 text-sm text-black/70">
                Buyers place offers during the listing period. When the timer ends, the seller can choose what to do. A sale only forms if the seller explicitly accepts an offer.
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-black/70 space-y-1">
                <li>No automatic winner. Seller controls acceptance.</li>
                <li></li>
              </ul>
            </div>
          </div>
        </StepCard>

        <StepCard step="Step 3" title="Convert interest in Messages">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Use Messages to ask questions and arrange pickup or postage.</li>
            <li>Keep messages respectful and report scams, abuse, or rule-breaking content.</li>
            <li>Never send ID photos or sensitive information you would not want exposed.</li>
          </ul>
        </StepCard>

        <StepCard step="Step 4" title="Complete the order">
          <p className="text-black/75">
            For Buy Now, the item is sold immediately. Use messages to arrange handover.
          </p>
          <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
            
            <li>After handover, leave feedback if available or report an issue if something went wrong.</li>
            
          </ul>
        </StepCard>

        <StepCard step="Step 5" title="Disputes, reporting, and safety">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>If a listing breaks rules, use <strong>Report</strong> on the listing or message thread.</li>
            <li>If something goes wrong, keep records such as screenshots, messages, and photos, then contact Support.</li>
            <li>Bidra may remove listings or restrict accounts where misuse is detected.</li>
          </ul>
        </StepCard>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Important notes</h2>
          <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
            <li><strong>Bidra is the platform only.</strong> Items are sold by users.</li>
            <li>Keep important details in Bidra messages for smoother resolution if something goes wrong.</li>
            <li>Fees, if any, are shown before you confirm actions. See <Link className="bd-link font-semibold" href="/legal/fees">Fees</Link>.</li>
            <li>Listings must follow our rules. Prohibited items are blocked. See <Link className="bd-link font-semibold" href="/legal/prohibited-items">Prohibited items</Link>.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">Legal pages</div>
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

