export const metadata = {
  title: "Bidra | Support & Safety",
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-[#0B0E11]">Support &amp; Safety</h1>
      <p className="mt-3 text-black/70">
        Bidra is an Australian marketplace where people list items and make offers. We want every transaction to feel safe.
        If something looks wrong, report it — we take safety seriously.
      </p>

      <div className="mt-8 space-y-6">
        <section className="rounded-xl border border-black/10 bg-slate-50 p-4">
          <h2 className="text-lg font-semibold text-[#0B0E11]">Safety tips</h2>
          <ul className="mt-2 list-disc pl-5 text-black/75 space-y-1">
            <li>Meet in a public place or bring someone with you.</li>
            <li>Avoid sharing unnecessary personal information.</li>
            <li>Inspect items before handing over money.</li>
            <li>Trust your instincts — if it feels off, walk away.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#0B0E11]">Scams &amp; fraud</h2>
          <ul className="mt-2 list-disc pl-5 text-black/75 space-y-1">
            <li>Be wary of pressure, urgency, or deals that seem too good to be true.</li>
            <li>Never share verification codes or passwords.</li>
            <li>If someone asks for unusual payment methods or private info, pause and reassess.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#0B0E11]">Report a listing or message</h2>
          <p className="mt-2 text-black/70">
            Use the <strong>Report</strong> button on the listing page. For repeated issues, accounts may be restricted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#0B0E11]">Need help?</h2>
          <p className="mt-2 text-black/70">
            Email us at <strong>support@bidra.com.au</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#0B0E11]">Related pages</h2>
          <ul className="mt-2 list-disc pl-5 text-black/75 space-y-1">
            <li><a className="text-[#1DA1F2] hover:underline" href="/legal/privacy">Privacy Policy</a></li>
            <li><a className="text-[#1DA1F2] hover:underline" href="/legal/terms">Terms of Service</a></li>
            <li><a className="text-[#1DA1F2] hover:underline" href="/legal/prohibited-items">Prohibited Items</a></li>
            <li><a className="text-[#1DA1F2] hover:underline" href="/legal/safety">Safety Tips</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
