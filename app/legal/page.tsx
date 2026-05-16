import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { ReferencePage, appNarrowShell } from "@/components/marketplace-redesign";

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

function LegalSidebar() {
  const links = [
    ["/legal", "Overview"],
    ["/legal/terms", "Terms"],
    ["/legal/privacy", "Privacy"],
    ["/legal/fees", "Fees"],
    ["/legal/prohibited-items", "Prohibited items"],
  ];
  return <aside className="rounded-[28px] border border-[#D8E6F8] bg-white p-3 shadow-sm lg:sticky lg:top-24"><div className="px-2 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#0E7490]">Legal</div><div className="grid gap-1">{links.map(([href,label]) => <Link key={href} href={href} className="rounded-2xl px-3 py-2.5 text-sm font-black text-[#07152E] transition hover:bg-[#EEF6FF]">{label}</Link>)}</div></aside>;
}

export default function LegalHubPage() {
  return (
    <ReferencePage>
      <div className={appNarrowShell + " py-5 sm:py-8"}>
        <BackButton href="/listings" label="Back to marketplace" />
        <div className="mt-4 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"><LegalSidebar /><div className="space-y-5">
        <section className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Legal</div>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">Legal hub</h1>
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
        </div></div>
    </ReferencePage>
  );
}
