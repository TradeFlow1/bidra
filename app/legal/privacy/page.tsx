import Link from "next/link";

function SectionCard(props: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-extrabold tracking-tight bd-ink">{props.title}</h2>
      <div className="mt-3">{props.children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Privacy</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Privacy on Bidra</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                This page explains how Bidra collects and uses personal information. We aim to minimise data collection and use only what is needed to operate the marketplace, provide account and listing tools, improve safety, investigate reports, preserve audit records, and comply with Australian requirements.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/legal" className="bd-btn bd-btn-primary text-center">
                Legal hub
              </Link>
              <Link href="/contact" className="bd-btn bd-btn-ghost text-center">
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Principle</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Data minimisation</div>
            <div className="mt-1 text-sm text-neutral-600">We aim to collect only what is needed to run the marketplace and support safety.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Marketplace context</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Privacy-safe location</div>
            <div className="mt-1 text-sm text-neutral-600">Suburb, state, and postcode are used in a privacy-conscious way for local trading context.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Trust</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Safety and compliance</div>
            <div className="mt-1 text-sm text-neutral-600">Some information is retained where needed for disputes, reports, fraud prevention, audit records, and legal obligations.</div>
          </div>
        </div>

        <SectionCard title="What we collect">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Account information such as email, username, and basic profile details you choose to provide.</li>
            <li>Location information for marketplace context using suburb, state, and postcode, shown in a privacy-safe way.</li>
            <li>Activity and usage data such as logs, moderation actions, report activity, and security events used to prevent abuse, diagnose issues, and improve reliability.</li>
            <li>Content you create including listings, offers, feedback, reports, support requests, and order-related records to operate the service and enforce rules.</li>
            <li>Messages you send through Bidra to provide messaging features, preserve transaction context, and support safety or fraud investigations where needed.</li>
          </ul>
        </SectionCard>

        <SectionCard title="How we use information">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Provide and maintain the marketplace including listings, messaging, offers, orders, and support.</li>
            <li>Detect and prevent fraud, spam, prohibited items, unsafe handover patterns, and abusive behaviour.</li>
            <li>Enforce our Terms and help keep the community safer.</li>
            <li>Communicate important service updates and account notices.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Sharing and disclosure">
          <p className="text-black/75 leading-7">
            We do not sell personal information. We may share information with trusted service providers only where needed to operate Bidra, such as hosting, email sending, analytics, and spam prevention. We may also disclose information where required by law or where reasonably necessary to protect users and the platform from harm, fraud, or security incidents.
          </p>
        </SectionCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Cookies and analytics">
            <p className="text-black/75 leading-7">
              Bidra uses cookies and similar technologies for essential functions such as keeping you signed in and helping us understand how the service is used. Where we use analytics or anti-abuse tools, we aim to choose privacy-respecting settings and collect only what we need.
            </p>
          </SectionCard>

          <SectionCard title="Data retention">
            <p className="text-black/75 leading-7">
              We retain information only for as long as needed to operate Bidra, comply with legal obligations, respond to support requests, and resolve disputes. Some records may be retained for safety, fraud prevention, and audit purposes.
            </p>
          </SectionCard>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Security">
            <p className="text-black/75 leading-7">
              We use reasonable security measures to protect personal information. No system is perfectly secure, so please use a strong password and avoid sharing sensitive information in messages that you would not want exposed.
            </p>
          </SectionCard>

          <SectionCard title="Your choices">
            <ul className="list-disc pl-5 text-black/75 space-y-2">
              <li>You can update many profile details in account settings.</li>
              <li>You can contact us to request access or correction of personal information, subject to verification.</li>
              <li>If you delete your account, some information may remain where required for safety, fraud prevention, or legal compliance.</li>
            </ul>
          </SectionCard>
        </div>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">Questions?</div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link className="bd-btn bd-btn-ghost text-center" href="/contact">Contact</Link>
            <Link className="bd-btn bd-btn-ghost text-center" href="/legal/terms">Terms</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
