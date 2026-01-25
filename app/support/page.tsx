import Link from "next/link";

export const metadata = {
  title: "Bidra | Support & Safety",
};

export default function SupportPage() {
  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Support &amp; Safety</h1>
          <p className="mt-3 text-black/70">
            Bidra is an Australian marketplace where people list items and make offers. We want every
            transaction to feel safe. If something looks wrong, report it — we take safety seriously.
          </p>
        </div>

        <section className="bd-card" id="safety">
          <h2 className="text-xl font-semibold">Safety tips</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-black/75">
            <li>Meet in a public place or bring someone with you.</li>
            <li>Avoid sharing unnecessary personal information.</li>
            <li>Do not share your phone number or email address in messages.</li>
            <li>Inspect items before handing over money.</li>
            <li>Trust your instincts — if it feels off, walk away.</li>
          </ul>
        </section>

        <section className="bd-card">
          <h2 className="text-xl font-semibold">Scams &amp; fraud</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-black/75">
            <li>Be wary of pressure, urgency, or deals that seem too good to be true.</li>
            <li>Never share verification codes or passwords.</li>
            <li>If someone asks for unusual payment methods or private info, pause and reassess.</li>
          </ul>
        </section>

        <section className="bd-card">
          <h2 className="text-xl font-semibold">Report a listing or message</h2>
          <p className="mt-2 text-black/70">
            Use the <strong>Report</strong> button on the listing page. For repeated issues, accounts
            may be restricted.
          </p>
        </section>

        <section className="bd-card">
          <h2 className="text-xl font-semibold">Need help?</h2>
          <p className="mt-2 text-black/70">
            Use our <a className="bd-link font-semibold" href="/contact">Contact page</a> for help.
          </p>
        </section>

        <section className="bd-card">
          <h2 className="text-xl font-semibold">Related pages</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-black/75">
            <li>
              <Link className="bd-link" href="/legal/privacy">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link className="bd-link" href="/legal/terms">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link className="bd-link" href="/legal/prohibited-items">
                Prohibited Items
              </Link>
            </li>
            <li>
              <Link className="bd-link" href="/support#safety">
                Safety Tips
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
