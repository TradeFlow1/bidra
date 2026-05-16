import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

function PricingCard(props: {
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-[#D8E1EA] bg-white p-5 shadow-sm">
      <div className="text-sm font-extrabold bd-ink">{props.title}</div>
      <div className="mt-2 text-sm bd-ink2 leading-7">{props.desc}</div>
      {props.children ? <div className="mt-3">{props.children}</div> : null}
    </div>
  );
}

export default function PricingPage() {
  return (
    <main className="bd-container py-10">
      <div className="mx-auto mb-4 w-full max-w-7xl px-4"><BackButton href="/" label="Back to home" /></div>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="rounded-[28px] border border-[#D8E1EA] bg-[linear-gradient(135deg,#F8FBFC_0%,#EAF6F8_100%)] p-6 shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0E7490]">Pricing</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Simple, visible pricing</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Bidra keeps pricing straightforward. Fees may change over time, but any applicable costs are shown in-product before you commit. Orders record sale details, and buyers and sellers arrange handover directly.
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
          <div className="rounded-[24px] border border-[#D8E1EA] bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#0E7490]">Source of truth</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-[#0F172A]">In-app pricing</div>
            <div className="mt-1 text-sm text-[#475569]">The price or fee shown in Bidra at the moment you act is the source of truth.</div>
          </div>

          <div className="rounded-[24px] border border-[#D8E1EA] bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#0E7490]">Simplicity</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-[#0F172A]">Clear fees</div>
            <div className="mt-1 text-sm text-[#475569]">Fees are shown before you confirm a paid action.</div>
          </div>

          <div className="rounded-[24px] border border-[#D8E1EA] bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#0E7490]">Current model</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-[#0F172A]">Local marketplace flow</div>
            <div className="mt-1 text-sm text-[#475569]">Bidra supports listings, offers, orders, and local pickup coordination inside the product.</div>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
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

        <div className="rounded-[28px] border border-[#D8E1EA] bg-white p-6 shadow-sm">
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
            Sell
          </Link>
        </div>
      </div>
    </main>
  );
}

