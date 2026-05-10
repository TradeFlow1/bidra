export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

function HelpCard(props: {
  title: string;
  desc: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="text-sm font-extrabold bd-ink">{props.title}</div>
      <div className="mt-2 text-sm bd-ink2 leading-7">{props.desc}</div>
      {props.href && props.cta ? (
        <div className="mt-3">
          <Link href={props.href} className="bd-btn bd-btn-ghost text-center">
            {props.cta}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function FaqItem(props: {
  question: string;
  answer: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="text-sm font-extrabold bd-ink">{props.question}</div>
      <div className="mt-2 text-sm bd-ink2 leading-7">{props.answer}</div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <main className="bd-container py-10">
      <div className="mx-auto w-full mb-4 w-full max-w-6xl px-4"><BackButton href="/" label="Back to home" /></div>
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Help</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Help</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Help with listings, offers, orders, accounts, reports, and support.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/support" className="bd-btn bd-btn-primary text-center">
                Support
              </Link>
              <Link href="/contact" className="bd-btn bd-btn-ghost text-center">
                Contact support
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Overview</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">How Bidra works</div>
            <div className="mt-1 text-sm text-neutral-600">See how listings, offers, orders, and messages work.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Support</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Get help</div>
            <div className="mt-1 text-sm text-neutral-600">Choose the right place to report an issue or contact support.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Rules</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Before you list</div>
            <div className="mt-1 text-sm text-neutral-600">Check prohibited items and marketplace rules before listing.</div>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <HelpCard
            title="How it works"
            desc="See how Buy Now, offers, orders, messages, pickup, and postage work."
            href="/how-it-works"
            cta="Open how it works"
          />
          <HelpCard
            title="Support"
            desc="Get help with reports, account issues, orders, and marketplace rules."
            href="/support"
            cta="Open support"
          />
          <HelpCard
            title="Contact support"
            desc="Send account, order, listing, or technical support requests."
            href="/contact"
            cta="Open contact"
          />
          <HelpCard
            title="Prohibited items"
            desc="Check what cannot be listed on Bidra before creating or editing a listing."
            href="/legal/prohibited-items"
            cta="Open prohibited items"
          />
        </div>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Quick guidance</h2>
          <ol className="mt-4 list-decimal pl-5 text-sm bd-ink2 leading-7 space-y-2">
            <li>Create a listing with clear details, honest condition notes, and accurate photos.</li>
            <li>Use messages to ask questions and arrange pickup or postage.</li>
            <li>After a sale, use messages to arrange pickup, postage, payment, and handover details.</li>
            <li>After handover, leave feedback if available or report an issue if something went wrong.</li>
          </ol>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Where to go</h2>
          <p className="mt-2 text-sm bd-ink2 leading-7">
            Choose the option that best matches your issue.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <HelpCard
              title="Report a listing or message"
              desc="Use Report on a listing or message thread for scams, prohibited items, abuse, or rule-breaking content."
              href="/support"
              cta="Open safety guidance"
            />
            <HelpCard
              title="Get help with an order or account"
              desc="Use Contact for account access, order questions, listing issues, or technical problems."
              href="/contact"
              cta="Contact support"
            />
            <HelpCard
              title="Learn the marketplace flow"
              desc="Use How it works for Buy Now, offers, orders, messages, pickup, and postage."
              href="/how-it-works"
              cta="Open guide"
            />
            <HelpCard
              title="Share product feedback"
              desc="Use Feedback for suggestions or product feedback."
              href="/feedback"
              cta="Send feedback"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Frequently asked questions</h2>
          <div className="grid gap-3">
            <FaqItem
              question="How do offers work?"
              answer={<>Read <Link href="/how-it-works" className="bd-link font-semibold">How it works</Link> for the difference between Buy Now and Timed Offers. Timed Offers do not create an automatic winner unless the seller explicitly accepts an offer.</>}
            />
            <FaqItem
              question="What items are prohibited?"
              answer={<>Check <Link href="/legal/prohibited-items" className="bd-link font-semibold">Prohibited items</Link> before listing. If you are unsure whether something is allowed, do not list it first.</>}
            />
            <FaqItem
              question="How do I report a problem?"
              answer={<>Use reporting in listings or message threads for rule-breaking content or behaviour. For order or handover issues, use the <Link href="/disputes" className="bd-link font-semibold">Resolution Centre</Link>, <Link href="/support" className="bd-link font-semibold">Support</Link>, or <Link href="/contact" className="bd-link font-semibold">Contact</Link>.</>}
            />
            <FaqItem
              question="How do I update my location?"
              answer={<>Location details can be updated from your Dashboard account section so your marketplace context stays accurate.</>}
            />
            <FaqItem
              question="Where do I see order progress?"
              answer={<>Orders and message actions are shown in your <Link href="/orders" className="bd-link font-semibold">Orders</Link> area.</>}
            />
            <FaqItem
              question="What if I still need help?"
              answer={<>Go to <Link href="/contact" className="bd-link font-semibold">Contact</Link> and include links, screenshots, order IDs, listing IDs, and exact error text where possible.</>}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

