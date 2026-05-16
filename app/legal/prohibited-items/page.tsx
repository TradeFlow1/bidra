import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { ReferencePage, appNarrowShell } from "@/components/marketplace-redesign";

export const metadata = { title: "Prohibited items - Bidra" };

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

export default function ProhibitedItemsPage() {
  return (
    <ReferencePage>
      <div className={appNarrowShell + " py-5 sm:py-8"}>
        <BackButton href="/listings" label="Back to marketplace" />
        <div className="mt-4 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"><LegalSidebar /><div className="space-y-5">
        <section className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Prohibited items</div>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">Items that cannot be listed</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Some goods, animals, services, and listing types are not allowed on Bidra.
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

        <section className="hidden gap-3 sm:grid sm:grid-cols-3">
          <InfoCard
            label="Rule level"
            title="Always prohibited"
            desc="These categories are not allowed and may be removed."
          />
          <InfoCard
            label="Review"
            title="Automated and manual"
            desc="Bidra may review listings to enforce marketplace rules."
          />
          <InfoCard
            label="Unsure?"
            title="Do not list first"
            desc="Contact support before listing uncertain items."
          />
        </section>

        <SectionCard title="Always prohibited">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Live animals</strong>, livestock, pets, wildlife, birds, fish, reptiles, insects, animal breeding listings, adoption, rehoming, or transfer of live animals.</li>
            <li><strong>Vapes and nicotine products</strong>, including e-cigarettes, vape devices, pods, nicotine pouches, and related consumables.</li>
            <li><strong>Alcohol</strong>, including alcoholic beverages.</li>
            <li><strong>Illegal drugs</strong> and drug paraphernalia intended for illicit use.</li>
            <li><strong>Sexual or fetish content</strong>, explicit sexual services, pornographic material, or adult sexual products intended for stimulation.</li>
            <li><strong>Weapons and weapon parts</strong> where unlawful or restricted, including items marketed primarily as weapons.</li>
            <li><strong>Stolen goods</strong> or items suspected to be stolen.</li>
            <li><strong>Counterfeit goods</strong>, replicas passed off as genuine, or items infringing intellectual property rights.</li>
            <li><strong>Hate, extremist, violent, or abusive content</strong>, including threats, harassment, or content targeting protected groups.</li>
            <li><strong>Hazardous chemicals, poisons, explosives, or unsafe materials</strong> where restricted or unsafe for consumer sale.</li>
            <li><strong>Illegal, unlawfully supplied, or regulation-evading goods</strong>.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Restricted, regulated, or unsafe items">
          <ul className="list-disc space-y-2 pl-5">
            <li>Some categories may have extra restrictions under Australian law or local regulations.</li>
            <li>Bidra may block items that create safety, fraud, compliance, or moderation risk.</li>
            <li>If an item needs licensing, age-gating, transport controls, safety checks, or compliance proof, do not assume it is allowed.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Fraud, deception, and unlawful activity">
          <ul className="list-disc space-y-2 pl-5">
            <li>Listings intended to scam, impersonate, mislead, or deceive users are prohibited.</li>
            <li>Fake documents, forged credentials, manipulated serials, or fraud-enabling tools are prohibited.</li>
            <li>Items that encourage unlawful conduct, bypass legal restrictions, or facilitate criminal activity are prohibited.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Services and non-item listings">
          <ul className="list-disc space-y-2 pl-5">
            <li>Explicit sexual services or exploitative services are prohibited.</li>
            <li>Unsafe, unlawful, or misleading service listings are prohibited.</li>
            <li>Bidra may remove listings that do not fit the marketplace model for physical goods and compliant local trading.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Enforcement">
          <ul className="list-disc space-y-2 pl-5">
            <li>Bidra may remove listings, restrict accounts, preserve audit records, or take other platform action.</li>
            <li>These examples are not exhaustive. Comparable safety, fraud, abuse, or compliance risks may also be removed.</li>
          </ul>
        </SectionCard>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Need guidance?</h2>
          <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
            <Link className={actionClass} href="/support">Support</Link>
            <Link className={actionClass} href="/legal/terms">Terms</Link>
            <Link className={actionClass} href="/contact">Contact</Link>
          </div>
        </section>
      </div>
        </div></div>
    </ReferencePage>
  );
}
