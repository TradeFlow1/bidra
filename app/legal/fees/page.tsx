import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Fees - Bidra" };

const actionClass = "inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto";

function FeeCard(props: {
  label: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">{props.label}</div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F172A]">{props.value}</div>
      <div className="mt-1 text-sm text-[#475569]">{props.desc}</div>
    </div>
  );
}

function SectionCard(props: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-xl font-extrabold tracking-tight bd-ink">{props.title}</h2>
      <div className="mt-3 text-sm bd-ink2 leading-7">{props.children}</div>
    </section>
  );
}

export default function FeesPage() {
  return (
    <main className="bd-container py-6 sm:py-10">
      <div className="mx-auto mb-4 w-full max-w-7xl px-4">
        <BackButton href="/listings" label="Back to marketplace" />
      </div>

      <div className="container max-w-7xl space-y-5">
        <section className="rounded-[30px] border border-[#D8E1F0] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Fees</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Bidra fees</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Current launch pricing is simple: $0 buyer fees, $0 standard listing fees, and 0% during launch.
              </p>
            </div>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Link href="/legal" className={actionClass}>
                Legal hub
              </Link>
              <Link href="/support" className={actionClass}>
                Support
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <FeeCard
            label="Buyer fees"
            value="$0"
            desc="Buyers do not pay Bidra to browse, watch, message, make offers, or use Buy Now."
          />
          <FeeCard
            label="Seller listing fees"
            value="$0"
            desc="Sellers can create standard listings for free under the current fee model."
          />
          <FeeCard
            label="Seller success fee"
            value="0%"
            desc="Seller success fee is 0% during launch."
          />
        </section>

        <SectionCard title="Current fee model">
          <p>
            Account creation, browsing, watching, messaging, standard listings, offers, and Buy Now buyer use are currently $0. Seller success fee is 0% during launch. This page is the public source of truth for the current fee model.
          </p>
        </SectionCard>

        <SectionCard title="Payment and handover">
          <p>
            Buyers and sellers arrange payment, refunds, pickup, postage, tracking, packaging, dispatch, and handover directly with each other in Messages. Bidra does not hold pooled customer funds, process marketplace payments, or act as escrow.
          </p>
        </SectionCard>

        <SectionCard title="If fees change later">
          <p>
            If Bidra introduces paid upgrades, listing promotion, payment processing, or seller success fees later, the fee will be shown before the user confirms that paid action.
          </p>
        </SectionCard>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Related pages</h2>
          <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
            <Link className={actionClass} href="/legal/terms">Terms</Link>
            <Link className={actionClass} href="/support">Support</Link>
            <Link className={actionClass} href="/how-it-works">How it works</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
