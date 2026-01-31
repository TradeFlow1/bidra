import Link from "next/link";

export const metadata = {
  title: "Support & Safety — Bidra",
};

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}
function Callout({ children }: { children: any }) {
  return (
    <div className="rounded-xl border bd-bd bg-white p-4 text-sm bd-ink2 leading-7">
      {children}
    </div>
  );
}

export default function SupportPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Support &amp; Safety</h1>
          <p className="bd-ink2 leading-7">
            Bidra is an Australian marketplace where people list items and connect directly. Safety matters.
            If something looks wrong, report it — we review reports and take enforcement action when needed.
          </p>
          <Callout>
            Need help? Use the <Link className="underline font-semibold" href="/contact">Contact</Link> page.
            For prohibited items, see <Link className="underline font-semibold" href="/legal/prohibited-items">Prohibited items</Link>.
          </Callout>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-2">
            <H2>Safety tips</H2>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm bd-ink2 leading-7">
              <li>Meet in a public place (or bring someone with you).</li>
              <li>Inspect items before paying or confirming pickup.</li>
              <li>Avoid sharing unnecessary personal information.</li>
              <li>Never share verification codes or passwords with anyone.</li>
              <li>If it feels off, walk away and report it.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>Scams &amp; fraud (common patterns)</H2>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm bd-ink2 leading-7">
              <li>Pressure/urgency (“pay now or I’ll give it to someone else”).</li>
              <li>Requests for unusual payment methods or remote access.</li>
              <li>Requests for codes, passwords, or “verification” screenshots.</li>
              <li>Fake shipping agents or “courier will collect with cash”.</li>
              <li>Deals that seem too good to be true.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>Reporting</H2>
            <p className="text-sm bd-ink2 leading-7">
              You can report listings and message threads directly from the site. Reports are reviewed, logged, and may result in
              actions like listing removal, account restrictions, or suspension for repeated or serious breaches.
            </p>
          </section>

          <section className="space-y-2">
            <H2>Disputes</H2>
            <p className="text-sm bd-ink2 leading-7">
              Most issues are resolved between buyer and seller. Bidra provides tools and enforcement for abuse,
              but Bidra is not the seller and is not a party to the sale contract between users.
            </p>
            <p className="text-sm bd-ink2 leading-7">
              If you believe someone is scamming or harassing you, report it and stop engaging.
            </p>
          </section>

          <section className="space-y-2">
            <H2>Contact support</H2>
            <p className="text-sm bd-ink2 leading-7">
              Use the Contact page for support requests. Include any relevant listing or order details so we can help faster.
            </p>
            <p className="text-sm bd-ink2 leading-7">
              <Link className="underline font-semibold" href="/contact">Go to Contact</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
