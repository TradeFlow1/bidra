export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

const actionClass = "inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto";

function HelpCard(props: {
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5">
      <div className="text-sm font-extrabold bd-ink">{props.title}</div>
      <div className="mt-2 text-sm bd-ink2 leading-7">{props.desc}</div>
      <div className="mt-4">
        <Link href={props.href} className={actionClass}>
          {props.cta}
        </Link>
      </div>
    </div>
  );
}

function FaqItem(props: {
  question: string;
  answer: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5">
      <div className="text-sm font-extrabold bd-ink">{props.question}</div>
      <div className="mt-2 text-sm bd-ink2 leading-7">{props.answer}</div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <main className="bd-container py-6 sm:py-10">
      <div className="mx-auto mb-4 w-full max-w-7xl px-4">
        <BackButton href="/" label="Back to home" />
      </div>

      <div className="container max-w-7xl space-y-5">
        <section className="rounded-[30px] border border-[#D8E1F0] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Help</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Help</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Find the right place for listings, offers, orders, accounts, reports, and support.
              </p>
            </div>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Link href="/support" className={actionClass}>
                Support
              </Link>
              <Link href="/contact" className={actionClass}>
                Contact support
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <HelpCard
            title="How it works"
            desc="Listings, offers, orders, messages, pickup, and postage."
            href="/how-it-works"
            cta="Open guide"
          />
          <HelpCard
            title="Support"
            desc="Reports, account issues, orders, and marketplace rules."
            href="/support"
            cta="Open support"
          />
          <HelpCard
            title="Contact support"
            desc="Account, order, listing, or technical issues."
            href="/contact"
            cta="Contact support"
          />
          <HelpCard
            title="Prohibited items"
            desc="Check what cannot be listed before selling."
            href="/legal/prohibited-items"
            cta="View rules"
          />
        </section>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Quick guidance</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <HelpCard
              title="Selling"
              desc="Use clear photos, honest condition notes, and pickup or postage details."
              href="/sell"
              cta="Sell"
            />
            <HelpCard
              title="Buying"
              desc="Review listing details, ask questions, and keep messages on Bidra."
              href="/listings"
              cta="Browse listings"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Frequently asked questions</h2>
          <div className="grid gap-3">
            <FaqItem
              question="How do offers work?"
              answer={<>Read <Link href="/how-it-works" className="bd-link font-semibold">How it works</Link> for Buy Now and Offers.</>}
            />
            <FaqItem
              question="What items are prohibited?"
              answer={<>Check <Link href="/legal/prohibited-items" className="bd-link font-semibold">Prohibited items</Link> before listing.</>}
            />
            <FaqItem
              question="How do I report a problem?"
              answer={<>Use <Link href="/support" className="bd-link font-semibold">Support</Link> or <Link href="/contact" className="bd-link font-semibold">Contact</Link>.</>}
            />
            <FaqItem
              question="Where do I see order progress?"
              answer={<>Open <Link href="/orders" className="bd-link font-semibold">Orders</Link>.</>}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
