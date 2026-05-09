import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

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

export default function SupportPage() {
  return (
    <main className="bd-container py-10">
      <div className="mx-auto mb-4 w-full max-w-6xl px-4"><BackButton href="/listings" label="Back to marketplace" /></div>
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Support and safety</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Help, trust, and safer trading</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Bidra is a trust-first local marketplace. We provide listing, offer, messaging, reporting, and order tools, but buyers and sellers remain responsible for payment, pickup, postage, refunds, and handover decisions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/contact" className="bd-btn bd-btn-secondary text-center">
                Contact support
              </Link>
              <Link href="/how-it-works" className="bd-btn bd-btn-secondary text-center">
                How it works
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Report issues</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Listings and messages</div>
            <div className="mt-1 text-sm text-neutral-600">Use in-product reporting when content or behaviour breaks rules so moderation context and evidence are preserved.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Support cases</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Orders and accounts</div>
            <div className="mt-1 text-sm text-neutral-600">Contact support for account or order issues that need investigation.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Best practice</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Stay on Bidra</div>
            <div className="mt-1 text-sm text-neutral-600">Keep important listing, payment, pickup, postage, refund, and handover details in Bidra Messages wherever possible.</div>
          </div>
        </div>

        <SectionCard title="If you need help">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <div className="text-sm font-extrabold bd-ink">Use Report for moderation</div>
              <p className="mt-2 text-sm text-black/70">Report listings or message threads when the issue is unsafe behaviour, scams, prohibited items, abuse, or rule-breaking content.</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <div className="text-sm font-extrabold bd-ink">Use Contact for support cases</div>
              <p className="mt-2 text-sm text-black/70">Contact support for account access, order questions, technical problems, or cases where you need a reply.</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <div className="text-sm font-extrabold bd-ink">Use Feedback for product ideas</div>
              <p className="mt-2 text-sm text-black/70">Send feedback for confusing copy, rough flow, feature ideas, or marketplace improvements that are not urgent support issues.</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <div className="text-sm font-extrabold bd-ink">Bring the right evidence</div>
              <p className="mt-2 text-sm text-black/70">Include listing links, order IDs, message context, screenshots, timestamps, and exact error text so the right queue can act faster.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="bd-btn bd-btn-secondary text-center" href="/contact">Contact support</Link>
            <Link className="bd-btn bd-btn-secondary text-center" href="/feedback">Send feedback</Link>
            <Link className="bd-btn bd-btn-secondary text-center" href="/legal/fees">Read fees</Link>
          </div>
        </SectionCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Safe buying (recommended)">
            <ul className="list-disc pl-5 text-black/75 space-y-2">
              <li>Meet in a public place for pickups. Bring a friend if possible.</li>
              <li>Inspect items before handing over money, especially electronics, bikes, and high-value goods.</li>
              <li>Be cautious of unrealistic prices, urgency pressure, or requests to rush key decisions.</li>
              <li>Arrange payment, pickup, postage, refunds, and handover details in Messages and keep the conversation on Bidra.</li>
            </ul>
          </SectionCard>

          <SectionCard title="Safe selling (recommended)">
            <ul className="list-disc pl-5 text-black/75 space-y-2">
              <li>Use clear photos and honest descriptions to reduce disputes.</li>
              <li>Do not rely on screenshots or unverified claims. Keep important details in Bidra Messages.</li>
              <li>If something changes, agree the new payment, pickup, postage, refund, or handover details in Messages.</li>
              <li>Never share your passwords, one-time codes, or other sensitive login details.</li>
            </ul>
          </SectionCard>
        </div>

        <SectionCard title="Scams and red flags">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Someone asks you to continue the transaction outside Bidra to avoid fees or records.</li>
            <li>Someone offers overpayment with a request to refund the difference.</li>
            <li>Someone refuses pickup inspection or pressures you to move everything outside Bidra Messages.</li>
            <li>Someone pressures you to communicate only by SMS, WhatsApp, or another app before agreeing key terms in Bidra Messages.</li>
          </ul>
          <p className="mt-3 text-sm text-black/60">
            If you see these patterns, stop and report. We investigate abusive behaviour, preserve relevant records, triage evidence, and may restrict accounts.
          </p>
        </SectionCard>

                <SectionCard title="Resolution centre">
          <p className="text-black/75">
            Most issues are resolved between buyer and seller. If something cannot be resolved, use the Resolution Centre to collect the right evidence, contact support, or report unsafe behaviour. Bidra can review platform evidence and take account or listing actions where supported, but does not act as escrow, payment provider, refund decision-maker, shipping provider, or pickup scheduler.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/disputes" className="bd-btn bd-btn-primary text-center">Open resolution centre</Link>
            <Link href="/contact" className="bd-btn bd-btn-secondary text-center">Contact support</Link>
          </div>
        </SectionCard>
        <SectionCard title="What account signals mean">
          <p className="text-black/75">
            Email confirmed, phone confirmed, 18+ recorded, member-since, completed-order feedback, and policy standing are account trust signals. They help users make better marketplace decisions, but they are not government ID verification, biometric checks, escrow, payment protection, delivery insurance, or a guarantee that a transaction will go smoothly.
          </p>
        </SectionCard>
        <SectionCard title="How Bidra reviews risk signals">
          <p className="text-black/75">
            Bidra records safety reports, scam or fraud report reasons, policy strikes, temporary restrictions, and order issue events so administrators can review evidence consistently. These signals support human moderation. They do not automatically ban users, decide payment disputes, score payment fraud, or replace police, bank, carrier, or payment-provider processes.
          </p>
        </SectionCard>
        <SectionCard title="Postage and shipping labels">
          <p className="text-black/75">
            Bidra does not currently sell shipping labels, calculate live postage rates, insure parcels, or manage Australia Post, Sendle, courier, or carrier claims. If buyer and seller agree postage, keep the carrier, tracking number, packaging photos, dispatch timing, and who pays postage in Messages.
          </p>
        </SectionCard>
        <SectionCard title="Message freshness and chat limits">
          <p className="text-black/75">
            Bidra messages keep listing and order conversations in one place with unread status, stored conversation history, reporting, deletion, and email notifications where available. Bidra does not currently provide WebSocket live chat, typing indicators, attachment uploads, mobile push notifications, or guaranteed delivery receipts.
          </p>
        </SectionCard>
        <SectionCard title="Notifications and push limits">
          <p className="text-black/75">
            Bidra currently surfaces notification-style updates through in-app counts and email notifications where email is configured. Browser push notifications, service worker push handling, Firebase Cloud Messaging, Apple Push Notification service, native mobile push, and guaranteed background delivery are not active yet.
          </p>
        </SectionCard>
        <SectionCard title="Analytics and privacy limits">
          <p className="text-black/75">
            Bidra currently uses internal operational records such as AdminEvent rows, ActivitySession rows, listing counts, order counts, offer counts, and message activity to understand platform health. Google Analytics, GA4, Meta Pixel, PostHog, Segment, Mixpanel, external attribution dashboards, and event warehouses are not active yet.
          </p>
        </SectionCard>
        <SectionCard title="Recommendations and discovery limits">
          <p className="text-black/75">
            Bidra currently uses rules-based discovery from active listing category, location, seller, recency, and explicit filters. AI personalisation, machine-learning ranking, vector search, embeddings, collaborative filtering, behavioural profiling, and paid placement ranking are not active yet.
          </p>
        </SectionCard>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">Read more</div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link className="bd-btn bd-btn-secondary text-center" href="/how-it-works">How it works</Link>
            <Link className="bd-btn bd-btn-secondary text-center" href="/legal/prohibited-items">Prohibited items</Link>
            <Link className="bd-btn bd-btn-secondary text-center" href="/legal/terms">Terms</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
