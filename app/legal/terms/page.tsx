export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Terms</h1>
      <p className="mt-3 text-base text-black/70">
        These Terms govern your use of Bidra. By using Bidra, you agree to follow these rules.
        Bidra is a marketplace platform — we are not the seller, not a payment provider, and not an auctioneer.
      </p>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">1) Eligibility and accounts</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li><strong>18+ accounts only.</strong> Under 18s may browse publicly but may not create accounts, list, message, or transact.</li>
          <li>You’re responsible for keeping your login details secure and for activity on your account.</li>
          <li>You must provide accurate information and keep your location details reasonably current.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">2) Listings and content</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Listings must be accurate, lawful, and not misleading (including title, description, photos, and condition).</li>
          <li>You must have the right to sell the item and it must not be stolen or counterfeit.</li>
          <li>Prohibited items are not allowed. See <a className="underline" href="/legal/prohibited-items">Prohibited items</a>.</li>
          <li>We may remove listings or restrict accounts to protect the marketplace.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">3) Sale formats</h2>

        <div className="mt-3 space-y-4 text-black/75">
          <div className="rounded-xl border border-black/10 p-4">
            <h3 className="font-semibold">Buy Now (binding sale)</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>When a seller enables Buy Now, they pre-authorise an immediate sale at the displayed price.</li>
              <li>When a buyer clicks Buy Now, the buyer commits to complete payment and follow the order flow.</li>
              <li>Cancellations are limited and may be restricted where abuse is detected.</li>
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
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">4) Messaging</h2>
        <p className="mt-3 text-black/75">
          Messages are provided to coordinate details and support safe transactions. You must not harass, threaten, or
          spam other users. We may restrict messaging where abuse or fraud is suspected.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">5) Fees</h2>
        <p className="mt-3 text-black/75">
          Fees (if any) are disclosed in-product before you confirm actions. See <a className="underline" href="/legal/fees">Fees</a>.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">6) Safety, reporting, and enforcement</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Use Report on listings and message threads to flag rule-breaking behaviour or content.</li>
          <li>We may remove content, suspend listings, or restrict accounts based on safety signals and investigations.</li>
          <li>We may log safety and enforcement events to maintain platform integrity.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">7) Disputes</h2>
        <p className="mt-3 text-black/75">
          Buyers and sellers are responsible for resolving most disputes directly. Bidra may assist with investigations and
          platform actions, but Bidra is not a seller, escrow agent, or insurer.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">8) Liability and service availability</h2>
        <p className="mt-3 text-black/75">
          Bidra is provided “as is” to the extent permitted by law. We work to keep the service reliable, but outages and errors can occur.
          Nothing in these Terms limits rights you may have under Australian Consumer Law where applicable.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">9) Changes to these Terms</h2>
        <p className="mt-3 text-black/75">
          We may update these Terms from time to time. If changes are material, we’ll take reasonable steps to notify users.
        </p>
      </section>

      <section className="mt-10 text-sm text-black/60">
        <p>
          See also: <a className="underline" href="/legal/privacy">Privacy</a>,{" "}
          <a className="underline" href="/support">Support & Safety</a>,{" "}
          <a className="underline" href="/how-it-works">How it works</a>.
        </p>
      </section>
    </main>
  );
}
