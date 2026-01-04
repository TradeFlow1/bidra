export const metadata = {
  title: "Bidra | Support & Safety",
};

export default function SupportPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Support &amp; Safety</h1>
        <p className="mt-2 text-sm bd-ink2">
          Bidra is an Australian marketplace where people list items and make offers. We want every transaction to feel safe.
          If something looks wrong, report it — we take safety seriously.
        </p>

        <div className="mt-8 space-y-6">
          <section className="bd-card p-5">
            <h2 className="text-lg font-extrabold bd-ink" id="safety">Safety tips</h2>
            <ul className="mt-2 list-disc pl-5 text-sm bd-ink2 space-y-1">
              <li>Meet in a public place or bring someone with you.</li>
              <li>Avoid sharing unnecessary personal information.</li>
              <li>Inspect items before handing over money.</li>
              <li>Trust your instincts — if it feels off, walk away.</li>
            </ul>
          </section>

          <section className="bd-card p-5">
            <h2 className="text-lg font-extrabold bd-ink">Scams &amp; fraud</h2>
            <ul className="mt-2 list-disc pl-5 text-sm bd-ink2 space-y-1">
              <li>Be wary of pressure, urgency, or deals that seem too good to be true.</li>
              <li>Never share verification codes or passwords.</li>
              <li>If someone asks for unusual payment methods or private info, pause and reassess.</li>
            </ul>
          </section>

          <section className="bd-card p-5">
            <h2 className="text-lg font-extrabold bd-ink">Report a listing or message</h2>
            <p className="mt-2 text-sm bd-ink2">
              Use the <strong className="bd-ink">Report</strong> button on the listing page. For repeated issues, accounts may be restricted.
            </p>
          </section>

          <section className="bd-card p-5">
            <h2 className="text-lg font-extrabold bd-ink">Need help?</h2>
            <p className="mt-2 text-sm bd-ink2">
              Email us at <strong className="bd-ink">support@bidra.com.au</strong>.
            </p>
          </section>

          <section className="bd-card p-5">
            <h2 className="text-lg font-extrabold bd-ink">Related pages</h2>
            <ul className="mt-2 list-disc pl-5 text-sm bd-ink2 space-y-1">
              <li><a className="underline underline-offset-4 text-[var(--bidra-blue)] hover:opacity-90" href="/legal/privacy">Privacy Policy</a></li>
              <li><a className="underline underline-offset-4 text-[var(--bidra-blue)] hover:opacity-90" href="/legal/terms">Terms of Service</a></li>
              <li><a className="underline underline-offset-4 text-[var(--bidra-blue)] hover:opacity-90" href="/legal/prohibited-items">Prohibited Items</a></li>
              <li><a className="underline underline-offset-4 text-[var(--bidra-blue)] hover:opacity-90" href="/support#safety">Safety Tips</a></li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
