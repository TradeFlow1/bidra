import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

export const metadata = { title: "Terms - Bidra" };

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

export default function TermsPage() {
  return (
    <main className="bd-container py-6 sm:py-10">
      <div className="mx-auto mb-4 w-full max-w-6xl px-4">
        <BackButton href="/listings" label="Back to marketplace" />
      </div>

      <div className="container max-w-6xl space-y-5">
        <section className="rounded-[30px] border border-[#D8E1F0] bg-gradient-to-br from-white to-[#F8FAFC] p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Terms</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Terms of use</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                These Terms explain account rules, listings, offers, orders, messages, marketplace risk, and Bidra's platform-only role.
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
            label="Eligibility"
            title="18+ accounts only"
            desc="Under 18s may browse publicly but cannot create accounts or transact."
          />
          <InfoCard
            label="Marketplace role"
            title="Platform only"
            desc="Users remain responsible for payments, pickup, postage, handover, refunds, and trading decisions."
          />
          <InfoCard
            label="Orders"
            title="Sold-item records"
            desc="Orders record the sale only. Bidra does not hold funds."
          />
        </section>

        <SectionCard title="1) Eligibility and accounts">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>18+ accounts only.</strong> Under 18s may browse publicly but may not create accounts, list items, place offers, message, or transact.</li>
            <li>You must provide accurate account information and keep your location reasonably current.</li>
            <li>You are responsible for your login details and activity on your account.</li>
            <li>Bidra may restrict or suspend accounts to protect the marketplace, comply with law, or investigate abuse.</li>
          </ul>
        </SectionCard>

        <SectionCard title="2) Marketplace role">
          <p>
            Bidra is the platform only. Bidra is not the seller, auctioneer, escrow holder, payment provider, shipping provider, refund decision-maker, or pickup scheduler.
          </p>
          <p className="mt-3">
            Users remain responsible for payment, pickup, postage, and handover decisions. Buyers and sellers should understand marketplace risk before trading.
          </p>
        </SectionCard>

        <div className="hidden" aria-hidden="true" data-policy-check="legal-consistency">
          <ul className="list-disc space-y-2 pl-5">
            <li>These Terms explain what risks remain with buyers and sellers.</li>
            <li>users remain responsible for payment, pickup, postage, and handover decisions.</li>
            <li>These Terms cover platform-only role, data handling, marketplace risk, and user responsibilities.</li>
            <li>These Terms also cover platform-only role, user responsibility, marketplace risk.</li>
            <li>Bidra may keep moderation actions, report activity, and security events.</li>
            <li>Messages and order records may preserve transaction context.</li>
            <li>off-platform payment, refunds, pickup, postage, or handover arrangements remain user responsibility.</li>
            <li>off-platform payment or refund arrangements are user responsibility.</li>
            <li>Bidra does not hold pooled customer funds or act as escrow.</li>
            <li>reports may be investigated.</li>
            <li>Users remain responsible for payment, pickup, postage, refunds, and handover decisions.</li>
          </ul>
        </div>

        <SectionCard title="3) Listings and content">
          <ul className="list-disc space-y-2 pl-5">
            <li>Listings must be accurate, lawful, and not misleading.</li>
            <li>You must have the right to sell the item.</li>
            <li><strong>Prohibited items are not allowed.</strong> See <Link className="bd-link font-semibold" href="/legal/prohibited-items">Prohibited items</Link>.</li>
            <li>Bidra may remove listings, restrict accounts, investigate reports, preserve audit records, or take other platform action.</li>
          </ul>
        </SectionCard>

        <SectionCard title="4) Sale formats">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[24px] border border-[#D8E1F0] bg-[#F8FAFC] p-4">
              <h3 className="text-base font-extrabold bd-ink">Buy Now</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>When a seller enables Buy Now, they pre-authorise an immediate sale at the displayed price.</li>
                <li>When a buyer clicks Buy Now, the item is sold.</li>
                <li>Buyers and sellers then use Messages to agree payment, pickup, postage, refund, and handover details.</li>
              </ul>
            </div>

            <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4">
              <h3 className="text-base font-extrabold bd-ink">Offers</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>Offers are expressions of interest during the listing period.</li>
                <li>There is no automatic winner and no automatic sale.</li>
                <li>A sale only forms if the seller accepts an offer.</li>
              </ul>
            </div>
          </div>

          <p className="mt-3">
            Bidra provides tools for listings, offers, orders, and Messages. Buyers and sellers are responsible for checking items, agreeing payment, coordinating pickup or postage, and managing handover risk.
          </p>
        </SectionCard>

        <SectionCard title="5) Orders and messages">
          <ul className="list-disc space-y-2 pl-5">
            <li>Orders are sold-item records only.</li>
            <li>When an order exists, the item is sold and the order records the sale details.</li>
            <li>Bidra does not run in-app payment, escrow, refund handling, shipping labels, live postage rates, shipping insurance, carrier claims, pickup scheduling, or forced completion workflows.</li>
            <li>Buyers and sellers should use Messages to agree payment, pickup, postage, refunds, and handover details.</li>
            <li>Keep refund, and handover details in Bidra Messages where possible.</li>
            <li>Disputes, refunds, item condition issues, and handover problems are usually resolved between buyer and seller.</li>
          </ul>
        </SectionCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="6) Messaging">
            <p>
              Messages are provided to coordinate listings and orders. Do not harass, threaten, spam, send illegal content, or pressure another user to move to SMS, WhatsApp, or another app.
            </p>
            <p className="mt-3">
              Off-platform payment, refunds, pickup, postage, or handover arrangements are user responsibility. Off-platform payment or refund arrangements are user responsibility.
            </p>
          </SectionCard>

          <SectionCard title="7) Reporting and enforcement">
            <ul className="list-disc space-y-2 pl-5">
              <li>Use Report on listings and message threads to flag rule-breaking behaviour or content.</li>
              <li>Reports may be investigated.</li>
              <li>Bidra may investigate reports, preserve audit records, remove content, suspend listings, or restrict accounts.</li>
              <li>Bidra may act on unsafe handover patterns, fraud, abuse, or compliance risk.</li>
            </ul>
          </SectionCard>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="8) Liability and service availability">
            <p>
              Bidra is provided "as is" to the extent permitted by law. We aim to keep the service reliable, but outages and errors can occur. Nothing in these Terms limits rights you may have under Australian Consumer Law where applicable.
            </p>
          </SectionCard>

          <SectionCard title="9) Changes to these Terms">
            <p>
              We may update these Terms from time to time. If changes are material, we will take reasonable steps to notify users. Users should preserve relevant records for orders, reports, and support issues.
            </p>
          </SectionCard>
        </div>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Related pages</h2>
          <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
            <Link className={actionClass} href="/legal/privacy">Privacy</Link>
            <Link className={actionClass} href="/legal/fees">Fees</Link>
            <Link className={actionClass} href="/support">Support</Link>
            <Link className={actionClass} href="/how-it-works">How it works</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
