import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

const actionClass = "inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto";

function StepCard(props: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">{props.step}</div>
      <h2 className="mt-2 text-xl font-extrabold tracking-tight bd-ink">{props.title}</h2>
      <div className="mt-3 text-sm bd-ink2 leading-7">{props.children}</div>
    </section>
  );
}

function InfoCard(props: {
  label: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">{props.label}</div>
      <div className="mt-1 text-lg font-extrabold tracking-tight text-[#0F172A]">{props.title}</div>
      <div className="mt-1 text-sm text-[#475569]">{props.desc}</div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="bd-container py-6 sm:py-10">
      <div className="mx-auto mb-4 w-full max-w-6xl px-4">
        <BackButton href="/" label="Back to home" />
      </div>

      <div className="container max-w-6xl space-y-5">
        <section className="rounded-[30px] border border-[#D8E1F0] bg-gradient-to-br from-white to-[#F8FAFC] p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">How it works</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">How Bidra works</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                List items, use Buy Now or make offers, and arrange pickup or postage in messages.
              </p>
            </div>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Link href="/sell/new" className={actionClass}>
                Sell
              </Link>
              <Link href="/listings" className={actionClass}>
                Browse listings
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <InfoCard
            label="Marketplace"
            title="Users sell items"
            desc="Bidra is the platform only. Items are sold by users."
          />
          <InfoCard
            label="Buy Now"
            title="Fixed price"
            desc="A buyer can accept the listed price and message the seller."
          />
          <InfoCard
            label="Offers"
            title="Seller decides"
            desc="Offers do not create an automatic winner."
          />
        </section>

        <StepCard step="Step 1" title="Create your account">
          <ul className="list-disc space-y-2 pl-5">
            <li>Accounts are for adults aged 18+.</li>
            <li>Set your location so buyers see pickup context.</li>
          </ul>
        </StepCard>

        <StepCard step="Step 2" title="Create a buyer-ready listing">
          <ul className="list-disc space-y-2 pl-5">
            <li>Add clear photos, condition, price, and pickup or postage details.</li>
            <li>Choose Buy Now or seller-reviewed offers.</li>
          </ul>
        </StepCard>

        <StepCard step="Step 3" title="Convert interest in Messages">
          <ul className="list-disc space-y-2 pl-5">
            <li>Use messages to answer questions and arrange handover.</li>
            <li>Keep important pickup, postage, payment, and handover details in messages.</li>
          </ul>
        </StepCard>

        <StepCard step="Step 4" title="Complete the handover">
          <p>
            Orders are sold-item records. Buyers and sellers arrange pickup or postage, payment, and handover details directly.
          </p>
        </StepCard>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Platform role</h2>
          <p className="mt-3 text-sm bd-ink2 leading-7">
            Bidra is a trust-first local marketplace and the platform only. Bidra is not the seller, auctioneer, escrow holder, payment provider, shipping provider, or pickup scheduler.
          </p>
          <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
            <Link className={actionClass} href="/legal/terms">Terms</Link>
            <Link className={actionClass} href="/legal/fees">Fees</Link>
            <Link className={actionClass} href="/legal/prohibited-items">Prohibited items</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
