export default function HowItWorksPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">How Bidra works</h1>
      <p className="mt-3 text-base text-black/70">
        Bidra is an Australian marketplace where people list items and connect directly.
        We are the platform only - we are not the seller, and we do not automatically award a winner.
      </p>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">1) Create an account</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li><strong>18+ only:</strong> accounts are for adults. Under 18s can browse publicly but cannot transact or message.</li>
          <li>Set your <strong>location</strong> (suburb, state, postcode) so buyers see realistic pickup context.</li>
          <li>Keep your profile accurate - it helps trust and reduces disputes.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">2) List an item</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Add a clear title, honest description, condition, and photos that show the actual item.</li>
          <li>Choose the sale format that matches how you want to sell:</li>
        </ul>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-black/10 p-4">
            <h3 className="font-semibold">Buy Now (binding)</h3>
            <p className="mt-2 text-sm text-black/70">
              You set a fixed price. When a buyer clicks Buy Now, it becomes a binding sale.
              This is the fastest path to a completed local handover.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-black/70 space-y-1">
              <li>Seller pre-authorises the sale by listing with Buy Now enabled.</li>
              <li>Buyer commits to complete the purchase under Bidra's rules.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-black/10 p-4">
            <h3 className="font-semibold">Timed Offers (seller chooses)</h3>
            <p className="mt-2 text-sm text-black/70">
              Buyers place offers during the listing period. When the timer ends, the seller can choose what to do.
              A sale only forms if the seller explicitly accepts an offer.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-black/70 space-y-1">
              <li>No automatic winner. Seller controls acceptance.</li>
              <li>Seller may decline or relist.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">3) Messages and pickup scheduling</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Use Messages only to clarify item details, condition, access, or pickup context. Pickup timing is scheduled in-app.</li>
          <li>For safety, keep communication respectful and clear. If anything feels off, report it.</li>
          <li>Never send ID photos or sensitive information you would not want exposed.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">4) Completing the order</h2>
        <p className="mt-3 text-black/75">
          For Buy Now purchases, the sale becomes binding first and pickup is then scheduled in-app. Follow the order flow shown on screen. After the in-person handover is finished, complete the order inside Bidra.
        </p>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>There is no in-app payment step in Bidra V2.</li>
          <li>After handover, mark the order complete inside Bidra.</li>
          <li>Leave feedback to help the community make better decisions.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">5) Disputes, reporting, and safety</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>If a listing breaks rules, use <strong>Report</strong> on the listing or message thread.</li>
          <li>If something goes wrong, keep records (screenshots, messages, photos) and contact Support.</li>
          <li>Bidra may remove listings, restrict accounts, or investigate patterns of abuse to keep the marketplace safe.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Important notes</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li><strong>Bidra is the platform only</strong> - items are sold by users, and we are not an auctioneer, escrow holder, shipping provider, or payment provider.</li>
          <li>Use the in-app order flow and keep records for smoother resolution if something goes wrong.</li>
          <li>Fees (if any) are shown before you confirm actions. See <a className="underline" href="/legal/fees">Fees</a>.</li>
          <li>Listings must follow our rules. Prohibited items are blocked. See <a className="underline" href="/legal/prohibited-items">Prohibited items</a>.</li>
        </ul>
      </section>

      <section className="mt-10 text-sm text-black/60">
        <p>
          Want the fine print? Read our <a className="underline" href="/legal/terms">Terms</a>,{" "}
          <a className="underline" href="/legal/privacy">Privacy</a>,{" "}
          <a className="underline" href="/legal/fees">Fees</a>, and{" "}
          <a className="underline" href="/legal/prohibited-items">Prohibited items</a>.
        </p>
      </section>
    </main>
  );
}