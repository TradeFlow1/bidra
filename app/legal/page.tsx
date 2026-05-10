import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Legal and policies - Bidra" };

const actionClass = "inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto";

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

function LegalCard(props: {
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
        <Link className={actionClass} href={props.href}>
          {props.cta}
        </Link>
      </div>
    </div>
  );
}

export default function LegalHubPage() {
  return (
    <main className="bd-container py-6 sm:py-10">
      <div className="mx-auto mb-4 w-full max-w-6xl px-4">
        <BackButton href="/listings" label="Back to marketplace" />
      </div>

      <div className="container max-w-6xl space-y-5">
        <section className="rounded-[30px] border border-[#D8E1F0] bg-gradient-to-br from-white to-[#F8FAFC] p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Legal</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Legal hub</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Key rules for using Bidra, listing items, privacy, fees, and prohibited items.
              </p>
            </div>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Link href="/how-it-works" className={actionClass}>
                How it works
              </Link>
              <Link href="/support" className={actionClass}>
                Support
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <InfoCard
            label="Overview"
            title="How it works"
            desc="Listings, offers, orders, messages, pickup, and postage."
          />
          <InfoCard
            label="Core rules"
            title="Terms and privacy"
            desc="Account rules, privacy, user responsibility, and platform role."
          />
          <InfoCard
            label="Safety"
            title="Policies and restrictions"
            desc="Prohibited items, fees, reports, and support guidance."
          />
        </section>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Core documents</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <LegalCard
              title="Terms"
              href="/legal/terms"
              cta="Read terms"
              desc="Rules for accounts, listings, sale formats, orders, messages, reports, and platform responsibilities."
            />
            <LegalCard
              title="Privacy"
              href="/legal/privacy"
              cta="Read privacy"
              desc="What Bidra collects, why it is used, how long it is kept, and privacy choices."
            />
            <LegalCard
              title="Fees"
              href="/legal/fees"
              cta="View fees"
              desc="Current fees for buyers, sellers, listings, offers, Buy Now, and seller success fees."
            />
            <LegalCard
              title="Prohibited items"
              href="/legal/prohibited-items"
              cta="View prohibited items"
              desc="Items and listing types that cannot be listed on Bidra."
            />
          </div>
        </section>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Help and safety</h2>
          <p className="mt-3 text-sm bd-ink2 leading-7">
            For account, order, listing, report, or safety issues, use Support.
          </p>
          <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
            <Link href="/support" className={actionClass}>
              Support
            </Link>
            <Link href="/contact" className={actionClass}>
              Contact support
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
