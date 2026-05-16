import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { ReferencePage, appNarrowShell } from "@/components/marketplace-redesign";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Privacy - Bidra" };

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

export default function PrivacyPage() {
  return (
    <ReferencePage>
      <div className={appNarrowShell + " py-5 sm:py-8"}>
        <BackButton href="/listings" label="Back to marketplace" />
        <div className="mt-4 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"><LegalSidebar /><div className="space-y-5">
        <section className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Privacy</div>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">Privacy on Bidra</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                How Bidra uses account, listing, message, support, report, and safety information.
              </p>
            </div>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Link href="/legal" className={actionClass}>
                Legal hub
              </Link>
              <Link href="/contact" className={actionClass}>
                Contact
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <InfoCard
            label="Principle"
            title="Collect what is needed"
            desc="Bidra collects information needed to run accounts, listings, messages, support, and safety tools."
          />
          <InfoCard
            label="Location"
            title="General area only"
            desc="Suburb, state, and postcode support local trading context. No street address is required."
          />
          <InfoCard
            label="Trust"
            title="Safety records"
            desc="Some records are kept for reports, fraud prevention, disputes, audit, and legal obligations."
          />
        </section>

        <SectionCard title="What we collect">
          <ul className="list-disc space-y-2 pl-5">
            <li>Account details such as email, username, and profile details you choose to provide.</li>
            <li>Location context such as suburb, state, and postcode.</li>
            <li>Listings, offers, orders, feedback, reports, support requests, and related records.</li>
            <li>Messages sent through Bidra, including order and listing context.</li>
            <li>Technical, security, moderation, and audit records used to protect the marketplace.</li>
          </ul>
        </SectionCard>

        <SectionCard title="How we use information">
          <ul className="list-disc space-y-2 pl-5">
            <li>Operate accounts, listings, messaging, offers, orders, reports, and support.</li>
            <li>Detect fraud, spam, unsafe behaviour, prohibited items, and abuse.</li>
            <li>Enforce Terms, investigate reports, and protect marketplace integrity.</li>
            <li>Send important account, security, and service notices.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Sharing and disclosure">
          <p>
            Bidra does not sell personal information. Information may be shared with trusted service providers where needed to operate the platform, such as hosting, email delivery, analytics, security, and spam prevention. Information may also be disclosed where required by law or where reasonably necessary to protect users and the platform.
          </p>
        </SectionCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Cookies and analytics">
            <p>
              Bidra uses cookies and similar technologies for core functions such as keeping users signed in, protecting accounts, and understanding service performance.
            </p>
          </SectionCard>

          <SectionCard title="Data retention">
            <p>
              Information is kept only as long as needed to operate Bidra, comply with obligations, respond to support requests, resolve disputes, prevent fraud, and maintain audit records.
            </p>
          </SectionCard>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Security">
            <p>
              Bidra uses reasonable safeguards to protect personal information. No system is perfectly secure, so users should use strong passwords and avoid sharing sensitive details in messages.
            </p>
          </SectionCard>

          <SectionCard title="Your choices">
            <ul className="list-disc space-y-2 pl-5">
              <li>Update account details in account settings where available.</li>
              <li>Contact Bidra to request access or correction, subject to verification.</li>
              <li>Some records may remain after account deletion where required for safety, fraud prevention, disputes, audit, or legal compliance.</li>
            </ul>
          </SectionCard>
        </div>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Questions</h2>
          <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
            <Link className={actionClass} href="/contact">Contact</Link>
            <Link className={actionClass} href="/legal/terms">Terms</Link>
          </div>
        </section>
      </div>
        </div></div>
    </ReferencePage>
  );
}
