export const metadata = {
  title: "How Bidra Works — Bidra",
};

export default function HowItWorksPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">How Bidra works</h1>
        <p className="mt-3 text-base bd-ink2">
          Bidra is an Australian marketplace where people list items and connect directly. We provide the tools to
          discover listings, message safely, make offers, and complete purchases.
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold bd-ink">1) Browse and search</h2>
          <ul className="mt-2 list-disc pl-6 bd-ink2 space-y-1">
            <li>Search listings by keyword and filter by location and price.</li>
            <li>Open a listing to see photos, details, condition, and the available purchase options.</li>
            <li>Watchlist items you’re interested in to check back later.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold bd-ink">2) Selling: create a listing</h2>
          <ul className="mt-2 list-disc pl-6 bd-ink2 space-y-1">
            <li>Create a listing with clear photos and an honest description.</li>
            <li>Add your location (suburb/state/postcode) so buyers can make informed decisions.</li>
            <li>Choose your sale type (Buy Now or Timed Offers) and set your price/terms.</li>
          </ul>
          <p className="mt-3 text-sm bd-ink2">
            Important: prohibited items are blocked at listing creation. If something is unsafe or prohibited, it cannot be listed.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold bd-ink">3) Two ways to buy</h2>

          <div className="mt-3 rounded-xl border bd-bd bg-white/60 p-4">
            <h3 className="font-extrabold bd-ink">Buy Now (instant purchase)</h3>
            <p className="mt-2 text-sm bd-ink2">
              Buy Now is an immediate purchase. When a buyer selects Buy Now, an order is created and the buyer is expected to pay.
              Sellers should only enable Buy Now when they are ready to complete the sale at the listed price.
            </p>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 space-y-1">
              <li>Best for: fixed-price items where you want a fast sale.</li>
              <li>Buyer: click Buy Now → follow payment instructions → confirm payment.</li>
              <li>Seller: fulfil the order once payment is confirmed.</li>
            </ul>
          </div>

          <div className="mt-4 rounded-xl border bd-bd bg-white/60 p-4">
            <h3 className="font-extrabold bd-ink">Timed Offers (highest offer, seller decides)</h3>
            <p className="mt-2 text-sm bd-ink2">
              Timed Offers let buyers place offers during the listing period. At the end, the highest offer is shown to the seller —
              but the seller must explicitly accept to form a sale. There is no automatic “winner”.
            </p>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 space-y-1">
              <li>Best for: price-discovery, rare items, or when you want to review the top offer first.</li>
              <li>Buyer: place an offer and wait for seller acceptance.</li>
              <li>Seller: accept the highest offer (or decline/relist).</li>
            </ul>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold bd-ink">4) Messaging and safety</h2>
          <ul className="mt-2 list-disc pl-6 bd-ink2 space-y-1">
            <li>Use Bidra messages to ask questions and arrange pickup/delivery details.</li>
            <li>Keep chats about the listing. Harassment, threats, and scams are not allowed.</li>
            <li>If something feels wrong, report the listing or the message thread so we can review it.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold bd-ink">5) Payment flow</h2>
          <p className="mt-2 text-sm bd-ink2">
            When payments are enabled for an order, Bidra provides a dedicated Pay Now page that guides the buyer through payment and confirmation.
            This keeps the purchase process clear and reduces misunderstandings.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold bd-ink">6) Accounts and eligibility</h2>
          <ul className="mt-2 list-disc pl-6 bd-ink2 space-y-1">
            <li>Bidra is 18+ for creating accounts and transacting.</li>
            <li>Restricted accounts cannot list, offer, message, or place orders.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold bd-ink">Need help?</h2>
          <p className="mt-2 text-sm bd-ink2">
            Visit the Support & Safety page for common questions and safety guidance.
          </p>
        </section>
      </div>
    </main>
  );
}
