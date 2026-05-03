import FeedbackClient from "./feedback-client";
import Link from "next/link";

export const metadata = { title: "Feedback - Bidra" };

function InfoCard(props: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{props.title}</div>
      <div className="mt-1 text-sm font-extrabold tracking-tight text-neutral-950">{props.desc}</div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Feedback</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Help shape Bidra</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Tell us what is working, what feels rough, and what would make Bidra more useful. Product feedback helps improve trust, flow, and day-to-day marketplace quality.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/help" className="bd-btn bd-btn-ghost text-center">
                Help
              </Link>
              <Link href="/contact" className="bd-btn bd-btn-primary text-center">
                Contact support
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <InfoCard
            title="Best feedback"
            desc="Clear examples, real friction points, and practical suggestions."
          />
          <InfoCard
            title="Useful context"
            desc="Include page names, listing IDs, order IDs, screenshots, or exact wording where relevant."
          />
          <InfoCard
            title="Need urgent help?"
            desc="Use support or contact for account, safety, or order issues that need action."
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-sm font-extrabold bd-ink">Share product feedback</div>
            <p className="mt-2 text-sm bd-ink2 leading-7">
              Use this form for suggestions, usability issues, confusing product moments, or ideas that could improve the marketplace experience.
            </p>
            <div className="mt-5">
              <FeedbackClient />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm font-extrabold bd-ink">Good examples of feedback</div>
              <ul className="mt-3 list-disc pl-5 text-sm bd-ink2 leading-7 space-y-2">
                <li>The order page made it hard to message the other person after buying or selling.</li>
                <li>The sell flow needs clearer hints around pricing, photos, or category choice.</li>
                <li>A message thread felt confusing because the key action was not obvious on mobile.</li>
                <li>A dashboard card felt useful, but the wording or priority could be improved.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm font-extrabold bd-ink">Use support instead when</div>
              <ul className="mt-3 list-disc pl-5 text-sm bd-ink2 leading-7 space-y-2">
                <li>You need help with an account, order, listing, or technical problem right now.</li>
                <li>You need to report abuse, unsafe behaviour, or a rule-breaking listing.</li>
                <li>You need investigation, not product feedback.</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/support" className="bd-btn bd-btn-ghost text-center">
                  Support and safety
                </Link>
                <Link href="/contact" className="bd-btn bd-btn-ghost text-center">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
