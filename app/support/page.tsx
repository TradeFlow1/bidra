export default function SupportPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Support & Safety</h1>
      <p className="mt-3 text-base text-black/70">
        Bidra is a community marketplace. We work hard to keep it safe, but buyers and sellers should always use
        common sense and follow best-practice safety steps.
      </p>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">If you need help</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Use <strong>Report</strong> on listings and message threads for rule-breaking content or behaviour.</li>
          <li>For account and order issues, contact us via <a className="underline" href="/contact">Contact</a>.</li>
          <li>Include links, screenshots, and order/listing IDs so we can investigate quickly.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Safe buying (recommended)</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Meet in a public place for pickups. Bring a friend if possible.</li>
          <li>Inspect items before handing over money (especially electronics, bikes, high-value goods).</li>
          <li>Be cautious of unrealistic prices, urgency pressure, or requests to Ã¢â‚¬Å“move fastÃ¢â‚¬Â off-platform.</li>
          <li>Pickup is scheduled in-app. No-shows and repeat reschedules affect reliability.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Safe selling (recommended)</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Use clear photos and honest descriptions to reduce disputes.</li>
          <li>Do not rely on screenshots or off-platform claims. Follow the order status and in-app pickup flow.</li>
          <li>If something changes, request a reschedule in-app. Messages are for clarification only.</li>
          <li>Never share your passwords, one-time codes, or other sensitive login details.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Scams and red flags</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Someone asks you to pay Ã¢â‚¬Å“outside BidraÃ¢â‚¬Â to avoid fees.</li>
          <li>Someone offers overpayment with a request to refund the difference.</li>
          <li>Someone refuses pickup inspection or pressures you to ignore the in-app pickup flow.</li>
          <li>Someone pressures you to communicate only by SMS/WhatsApp before agreeing key terms.</li>
        </ul>
        <p className="mt-3 text-sm text-black/60">
          If you see these patterns, stop and report. We investigate abusive behaviour and may restrict accounts.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Disputes</h2>
        <p className="mt-3 text-black/75">
          Most issues are resolved between buyer and seller. If you canÃ¢â‚¬â„¢t resolve it, contact Support with your order
          ID, listing link, and evidence. Bidra may take platform actions (like removing listings or restricting
          accounts) but does not act as a seller, escrow holder, shipping provider, or payment provider.
        </p>
      </section>

      <section className="mt-10 text-sm text-black/60">
        <p>
          Read more: <a className="underline" href="/how-it-works">How it works</a>,{" "}
          <a className="underline" href="/legal/prohibited-items">Prohibited items</a>,{" "}
          <a className="underline" href="/legal/terms">Terms</a>.
        </p>
      </section>
    </main>
  );
}
