export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import {
  HelpArticleCard,
  PageHero,
  PageShell,
  SearchBarPanel,
  SafetyPanel,
  SectionHeader,
  TrustBadge,
} from "@/components/marketplace-ui";

function FaqItem(props: { question: string; answer: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-[#D7E2F1] bg-white p-4 shadow-sm">
      <h3 className="text-base font-black text-[#07152E]">{props.question}</h3>
      <div className="mt-2 text-sm leading-6 text-[#526173]">
        {props.answer}
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <PageShell>
      <BackButton href="/" label="Back to home" />
      <div className="mt-4">
        <PageHero
          badge="Help Centre"
          title="Help Centre"
          description="Guidance for buying, selling, offers, messages, handover, reports, and account settings on Bidra."
        >
          <div className="mt-6 max-w-3xl">
            <SearchBarPanel
              action="/listings"
              placeholder="Search listings, categories or suburbs"
            />
          </div>
        </PageHero>
      </div>

      <section className="bd-section">
        <SectionHeader
          eyebrow="Popular topics"
          title="Find the right next step"
          description="Concise marketplace guidance for safer local deals."
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HelpArticleCard
            href="/how-it-works"
            title="Getting started"
            description="How browsing, Buy now, offers, messages and handover fit together."
            icon="↗"
          />
          <HelpArticleCard
            href="/listings"
            title="Buying safely"
            description="Review item details, message sellers, and arrange handover directly."
            icon="✓"
          />
          <HelpArticleCard
            href="/sell/new"
            title="Selling on Bidra"
            description="Create a clear listing with photos, price, condition and handover notes."
            icon="$"
          />
          <HelpArticleCard
            href="/dashboard"
            title="Account & settings"
            description="Manage listings, saved items, orders, messages and account signals."
            icon="•"
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <SectionHeader eyebrow="FAQ" title="Frequently asked questions" />
          <div className="mt-5 grid gap-3">
            <FaqItem
              question="How do offers work?"
              answer={
                <>
                  Use{" "}
                  <Link
                    href="/listings?type=OFFERABLE"
                    className="bd-link font-bold"
                  >
                    Make an offer
                  </Link>{" "}
                  on eligible listings. The seller can accept, decline, or
                  respond.
                </>
              }
            />
            <FaqItem
              question="Does Bidra handle payments or escrow?"
              answer="No. Bidra is a marketplace platform. Buyers and sellers arrange payment, pickup, postage and handover directly."
            />
            <FaqItem
              question="How do I report a problem?"
              answer={
                <>
                  Use{" "}
                  <Link href="/support" className="bd-link font-bold">
                    Support
                  </Link>{" "}
                  or{" "}
                  <Link href="/contact" className="bd-link font-bold">
                    Contact support
                  </Link>{" "}
                  for listing, account, order or safety issues.
                </>
              }
            />
            <FaqItem
              question="Where do messages appear?"
              answer={
                <>
                  Messages appear when you ask about listings, make offers, buy,
                  or sell. Open{" "}
                  <Link href="/messages" className="bd-link font-bold">
                    Messages
                  </Link>
                  .
                </>
              }
            />
          </div>
        </div>
        <div className="grid gap-4 self-start">
          <SafetyPanel />
          <div className="rounded-[24px] border border-[#D7E2F1] bg-[#07152E] p-5 text-white shadow-sm">
            <h2 className="text-xl font-black">Need more help?</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Contact support with the listing, order, or message details so the
              team can review the issue.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-[#07152E]"
            >
              Contact support
            </Link>
          </div>
        </div>
      </section>

      <section className="bd-section grid gap-3 sm:grid-cols-3">
        <TrustBadge
          title="Keep conversations in Bidra"
          description="Messages create a clearer record for buyers and sellers."
          icon="messages"
        />
        <TrustBadge
          title="Check details before handover"
          description="Confirm condition, inclusions, pickup and postage before agreeing."
          icon="safe"
        />
        <TrustBadge
          title="Report suspicious behaviour"
          description="Use support pathways when something does not feel right."
          icon="handover"
        />
      </section>
    </PageShell>
  );
}
