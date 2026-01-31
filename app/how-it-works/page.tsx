export const metadata = {
  title: "How Bidra Works — Bidra",
};

export default function HowItWorksPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">How Bidra works</h1>
          <p className="text-base bd-ink2">
            Bidra is an Australian marketplace where people list items and connect directly. We provide tools to discover listings,
            message safely, make offers, and create orders. Bidra is a platform only — not the seller.
          </p>
        </header>

        <section>
          <h2 className="text-lg font-extrabold bd-ink">1) Browse and search</h2>
          <ul className="mt-2 list-disc pl-6 bd-ink2 space-y-1">
            <li>Search listings by keyword and filter by location and price.</li>
            <li>Open a listing to see photos, details, condition, and purchase options.</li>
            <li>Use Watchlist to keep track of items.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold bd-ink">2) Sell: create a listing</h2>
          <ul className="mt-2 list-disc pl-6 bd-ink2 space-y-1">
            <li>Add clear photos and an honest description.</li>
            <li>Add location (suburb/state/postcode) so buyers can make informed decisions.</li>
            <li>Choose a sale type (Buy Now or Timed Offers).</li>
          </ul>
          <p className="mt-3 text-sm bd-ink2">
            Prohibited items are blocked at listing creation. If something is unsafe or prohibited, it cannot be listed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold bd-ink">3) Two ways to buy</h2>

          <div className="mt-3 rounded-xl border bd-bd bg-white/60 p-4">
            <h3 className="font-extrabold bd-ink">Buy Now (binding purchase)</h3>
            <p className="mt-2 text-sm bd-ink2">
              Buy Now is an immediate, binding purchase path. When a buyer selects Buy Now, an order is created and the buyer is expected to pay.
              Sellers should only enable Buy Now when they are ready to sell at that price.
            </p>
          </div>

          <div className="mt-4 rounded-xl border bd-bd bg-white/60 p-4">
            <h3 className="font-extrabold bd-ink">Timed Offers (highest offer shown, seller decides)</h3>
            <p className="mt-2 text-sm bd-ink2">
              Buyers place offers during the listing period. At the end, the highest offer is shown to the seller — but the seller must explicitly accept
              to form a sale. There is no automatic “winner”.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-extrabold bd-ink">4) Messaging and safety</h2>
          <ul className="mt-2 list-disc pl-6 bd-ink2 space-y-1">
            <li>Use Bidra messages to ask questions and arrange pickup/delivery.</li>
            <li>Meet in public, inspect items before paying, and keep a record of communication.</li>
            <li>Report suspicious listings or messages so we can review them.</li>
          </ul>
          <p className="mt-3 text-sm">
            Read more: <a className="bd-link font-semibold" href="/support">Support &amp; Safety</a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold bd-ink">5) Orders and payment</h2>
          <p className="mt-2 text-sm bd-ink2">
            When an order requires payment, Bidra provides a dedicated Pay Now page that guides the buyer through payment steps and confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold bd-ink">6) Accounts</h2>
          <ul className="mt-2 list-disc pl-6 bd-ink2 space-y-1">
            <li>Bidra is 18+ for creating accounts and transacting.</li>
            <li>Restricted accounts cannot list, offer, message, or place orders.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
