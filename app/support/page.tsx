import Link from "next/link";

export const metadata = {
  title: "Support & Safety — Bidra",
};

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}

export default function SupportPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Support &amp; Safety</h1>
        <p className="mt-3 bd-ink2 leading-7">
          Bidra is an Australian marketplace where people list items and connect directly. We take safety seriously.
          If something looks wrong, report it — we review reports and take enforcement action when needed.
        </p>

        <div className="mt-6 rounded-xl border bd-bd bg-white p-6 space-y-8">
          <section id="safety" className="space-y-2">
            <H2>Safety tips</H2>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm bd-ink2">
              <li>Meet in a public place (or bring someone with you).</li>
              <li>Inspect items before paying or confirming pickup.</li>
              <li>Avoid sharing unnecessary personal information.</li>
              <li>Never share verification codes or passwords.</li>
              <li>If it feels off, walk away and report it.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>Scams &amp; fraud (common patterns)</H2>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm bd-ink2">
              <li>Pressure/urgency (“pay now or I’ll give it to someone else”).</li>
              <li>Requests for unusual payment methods or off-platform tricks.</li>
              <li>Requests for codes, passwords, or remote access.</li>
              <li>Deals that seem too good to be true.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>Reporting</H2>
            <p className="mt-2 text-sm bd-ink2 leading-6">
              Use the <strong>Report</strong> button on a listing or in a message thread. Reports help us identify prohibited items, scams,
              harassment, and unsafe behaviour. Repeat or severe issues may result in account restrictions.
            </p>
          </section>

          <section className="space-y-2">
            <H2>Prohibited items</H2>
            <p className="mt-2 text-sm bd-ink2 leading-6">
              Prohibited items are blocked at listing creation. There is no “review” path for prohibited items.
            </p>
            <p className="text-sm">
              <Link className="bd-link font-semibold" href="/legal/prohibited-items">
                Read prohibited items
              </Link>
            </p>
          </section>

          <section className="space-y-2">
            <H2>Need help?</H2>
            <p className="mt-2 text-sm bd-ink2 leading-6">
              If you need help with your account or a safety issue, use Contact. If you want to suggest improvements, use Feedback.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className="bd-btn bd-btn-outline" href="/contact">Contact</Link>
              <Link className="bd-btn bd-btn-outline" href="/feedback">Feedback</Link>
              <Link className="bd-btn bd-btn-outline" href="/how-it-works">How it works</Link>
              <Link className="bd-btn bd-btn-outline" href="/legal/terms">Terms</Link>
              <Link className="bd-btn bd-btn-outline" href="/legal/privacy">Privacy</Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
