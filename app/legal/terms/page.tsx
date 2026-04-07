export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Terms</h1>
      <p className="mt-3 text-base text-black/70">
        These Terms govern your use of Bidra. By accessing or using Bidra, you agree to these Terms.
        Bidra is a marketplace platform only - we are not the seller of items, not a payment provider, and not an auctioneer.
      </p>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">1) Eligibility and accounts</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>
            <strong>18+ accounts only.</strong> Under 18s may browse publicly but may not create accounts, list items, place offers, message, or transact.
          </li>
          <li>You must provide accurate information and keep your account details reasonably current (including your location).</li>
          <li>You're responsible for keeping your login details secure and for all activity on your account.</li>
          <li>We may restrict or suspend accounts to protect the marketplace, comply with law, or investigate abuse.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">2) Your responsibilities</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>You must comply with applicable Australian laws and not use Bidra for unlawful activity.</li>
          <li>You must not harass, threaten, scam, impersonate, or spam other users.</li>
          <li>You must not attempt to bypass safety measures or misuse reports, feedback, or messaging tools.</li>
          <li>You must not upload viruses, automated scraping, or attempt to interfere with site operations.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">3) Listings and content</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Listings must be accurate, lawful, and not misleading (title, description, photos, condition, and location context).</li>
          <li>You must have the right to sell the item and it must not be stolen, counterfeit, or unlawfully supplied.</li>
          <li>
            <strong>Prohibited items are not allowed</strong> and may be removed without notice. See{" "}
            <a className="underline" href="/legal/prohibited-items">Prohibited items</a>.
          </li>
          <li>We may remove listings or restrict accounts to protect users, reduce fraud, and maintain trust.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">4) Sale formats</h2>

        <div className="mt-3 space-y-4 text-black/75">
          <div className="rounded-xl border border-black/10 p-4">
            <h3 className="font-semibold">Buy Now (binding sale)</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>When a seller enables Buy Now, they pre-authorise an immediate sale at the displayed price.</li>
              <li>When a buyer clicks Buy Now, the buyer commits to complete the order and follow the scheduled pickup flow.</li>
              <li>Buy Now is designed for faster completion and clearer expectations.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-black/10 p-4">
            <h3 className="font-semibold">Timed Offers (seller acceptance required)</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Offers are expressions of interest during the listing period.</li>
              <li>When the timer ends, there is no automatic winner and no automatic sale.</li>
              <li>A sale only forms if the seller explicitly accepts an offer (including the highest offer).</li>
            </ul>
          </div>
        </div>

        <p className="mt-3 text-sm text-black/60">
          Bidra provides tools for listing, offers, messaging, and order status. Buyers and sellers are responsible for their decisions and actions.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">5) Orders, pickup scheduling, and completion</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>When an order exists, it represents a binding commitment under the relevant flow (e.g., Buy Now).</li>
          <li>Bidra shows order status, pickup scheduling, and completion steps in-app, but <strong>Bidra does not hold funds</strong> and <strong>does not guarantee outcomes</strong>.</li>
          <li>Buyers and sellers should follow the in-app order flow, complete pickup carefully, and keep records (messages, photos).</li>
          <li>Disputes are usually resolved between buyer and seller. Bidra may take platform actions (e.g., restrictions) where misuse or fraud is detected.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">6) Messaging</h2>
        <p className="mt-3 text-black/75">
          Messages are provided to coordinate listings and orders. You must not harass, threaten, spam, or send illegal content.
          We may restrict messaging or remove content where abuse, fraud, or safety risk is suspected.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">7) Reporting, enforcement, and integrity</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Use Report on listings and message threads to flag rule-breaking behaviour or content.</li>
          <li>We may remove content, suspend listings, restrict accounts, or investigate suspicious patterns to keep the marketplace safe.</li>
          <li>We may log safety and enforcement events for audit and fraud prevention purposes.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">8) Liability and service availability</h2>
        <p className="mt-3 text-black/75">
          Bidra is provided "as is" to the extent permitted by law. We aim to keep the service reliable, but outages and errors can occur.
          Nothing in these Terms limits rights you may have under Australian Consumer Law where applicable.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">9) Changes to these Terms</h2>
        <p className="mt-3 text-black/75">
          We may update these Terms from time to time. If changes are material, we'll take reasonable steps to notify users.
        </p>
      </section>

      <section className="mt-10 text-sm text-black/60">
        <p>
          See also: <a className="underline" href="/legal/privacy">Privacy</a>,{" "}
          <a className="underline" href="/legal/fees">Fees</a>,{" "}
          <a className="underline" href="/support">Support &amp; Safety</a>,{" "}
          <a className="underline" href="/how-it-works">How it works</a>.
        </p>
      </section>
    </main>
  );
}
