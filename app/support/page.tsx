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

export default function SupportPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Support and safety</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Help, trust, and safer trading</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Bidra is a trust-first local marketplace. We provide listing, offer, messaging, reporting, and sold-item record tools, but buyers and sellers remain responsible for payment, pickup, postage, refunds, and handover decisions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/contact" className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">
                Contact support
              </Link>
              <Link href="/how-it-works" className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">
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
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Use <strong>Report</strong> on listings and message threads for rule-breaking content or behaviour so the moderation queue receives the right context.</li>
            <li>For account and order issues, contact us via <Link className="bd-link font-semibold" href="/contact">Contact</Link>.</li>
            <li>For current pricing, read <Link className="bd-link font-semibold" href="/legal/fees">Bidra fees</Link>: $0 buyer fees, $0 standard listing fees, and 0% seller success fee during launch.</li>
            <li>Include links, screenshots, message context, timestamps, and order or listing IDs so moderators can triage quickly.</li>
          </ul>
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

        <SectionCard title="Disputes">
          <p className="text-black/75">
            Most issues are resolved between buyer and seller. If you cannot resolve it, contact Support with your order ID, listing link, Messages, and evidence. Bidra may take platform actions such as removing listings or restricting accounts, but does not act as a seller, escrow holder, payment provider, refund decision-maker, shipping provider, or pickup scheduler.
          </p>
        </SectionCard>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">Read more</div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5" href="/how-it-works">How it works</Link>
            <Link className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5" href="/legal/prohibited-items">Prohibited items</Link>
            <Link className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5" href="/legal/terms">Terms</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
