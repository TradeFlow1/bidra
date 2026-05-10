import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

export const metadata = { title: "Bidra | Resolution Centre" };

function StepCard(props: { title: string; body: string; items?: string[] }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="text-sm font-extrabold bd-ink">{props.title}</div>
      <p className="mt-2 text-sm leading-7 bd-ink2">{props.body}</p>
      {props.items && props.items.length ? (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-7 bd-ink2">
          {props.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function Page() {
  return (
    <main className="bd-container py-10">
      <div className="mx-auto w-full mb-4 w-full max-w-6xl px-4"><BackButton href="/support" label="Back to support" /></div>
      <div className="container max-w-6xl space-y-5">
        <section className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Resolution centre</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Help with order, listing, and message issues</h1>
              <p className="mt-2 text-sm leading-7 bd-ink2 sm:text-base">
                Get help with listings, messages, orders, pickup, or postage issues.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/contact" className="bd-btn bd-btn-primary text-center">Contact support</Link>
              <Link href="/support" className="bd-btn bd-btn-secondary text-center">Safety guidance</Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <StepCard
            title="1. Keep the record clear"
            body="Use Bidra Messages to confirm what happened and what each side expected."
            items={["Keep listing links, order IDs, photos, screenshots, dates, times, carrier names, tracking details, packaging photos, and dispatch proof.", "Do not delete messages that explain the agreement or the problem."]}
          />
          <StepCard
            title="2. Try a practical resolution"
            body="Most marketplace problems are resolved directly between buyer and seller."
            items={["Agree changes in Messages before pickup, postage, refund, or handover.", "Pause if terms suddenly change or the other person pressures you to leave Bidra."]}
          />
          <StepCard
            title="3. Escalate the right way"
            body="Choose the route that preserves the right evidence for review."
            items={["Use Report for unsafe listings, scams, abuse, prohibited items, or message-thread behaviour.", "Use Contact for order, account, technical, or billing questions that need a reply."]}
          />
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">What Bidra can review</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <div className="text-sm font-extrabold bd-ink">Platform safety issues</div>
              <p className="mt-2 text-sm leading-7 bd-ink2">Report scams, abuse, unsafe behaviour, prohibited items, or misleading listings.</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <div className="text-sm font-extrabold bd-ink">Order support issues</div>
              <p className="mt-2 text-sm leading-7 bd-ink2">Include order IDs, listing links, messages, photos, tracking, and screenshots.</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight text-amber-950">Important limits</h2>
          <p className="mt-3 text-sm leading-7 text-amber-950">
            Bidra can review platform evidence and take account or listing action. We do not process payments, hold escrow, decide refunds, or manage shipping.
          </p>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Evidence checklist</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 bd-ink2">
            <li>Order ID or listing link.</li>
            <li>Message thread link or screenshots of the relevant messages.</li>
            <li>Photos of item condition, packaging, pickup, dispatch, or delivery where relevant.</li>
            <li>Payment, pickup, postage, refund, or handover terms that were agreed in Messages.</li>
            <li>Dates, times, carrier names, tracking numbers, dispatch receipts, usernames, and exact error text.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/contact" className="bd-btn bd-btn-primary text-center">Start a support request</Link>
            <Link href="/orders" className="bd-btn bd-btn-secondary text-center">Open orders</Link>
            <Link href="/messages" className="bd-btn bd-btn-secondary text-center">Open messages</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

