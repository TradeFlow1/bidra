export const metadata = {
  title: "How Bidra Works — Bidra",
};

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}

export default function HowItWorksPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">How Bidra works</h1>
        <p className="mt-3 text-base bd-ink2 leading-7">
          Bidra is an Australian marketplace where people list items and connect directly. We provide tools to browse,
          message safely, make offers, and complete purchases with clear order flows.
        </p>

        <section className="mt-8">
          <H2>1) Browse &amp; search</H2>
          <ul className="mt-2 list-disc pl-6 bd-ink2 space-y-1">
            <li>Search listings by keyword and filter by location and price.</li>
            <li>Open a listing to see photos, details, condition, and purchase options.</li>
            <li>Use watchlist to save items and come back later.</li>
          </ul>
        </section>

        <section className="mt-8">
          <H2>2) Sell: create a listing</H2>
          <ul className="mt-2 list-disc pl-6 bd-ink2 space-y-1">
            <li>Add clear photos and an honest description.</li>
            <li>Include your suburb/state/postcode so buyers can make informed decisions.</li>
            <li>Choose your sale type (Buy Now or Timed Offers) and set your price.</li>
          </ul>
          <p className="mt-3 text-sm bd-ink2">
            Prohibited items are blocked at listing creation. If something is unsafe or prohibited, it cannot be listed.
          </p>
        </section>

        <section className="mt-8">
          <H2>3) Two ways to buy</H2>

          <div className="mt-3 rounded-xl border bd-bd bg-white p-5">
            <h3 className="font-extrabold bd-ink">Buy Now (instant purchase)</h3>
            <p className="mt-2 text-sm bd-ink2 leading-6">
              Buy Now is a binding purchase path. The seller pre-authorises the sale at the Buy Now price. When a buyer selects Buy Now,
              an order is created and the buyer is expected to pay using the payment options shown for that order.
            </p>
            <ul className="mt-3 list-disc pl-6 text-sm bd-ink2 space-y-1">
              <li>Best for fixed-price items where you want a fast sale.</li>
              <li>Buyer: Buy Now → follow payment instructions → confirm payment.</li>
              <li>Seller: confirm/fulfil once payment is confirmed.</li>
            </ul>
          </div>

          <div className="mt-4 rounded-xl border bd-bd bg-white p-5">
            <h3 className="font-extrabold bd-ink">Timed Offers (highest offer, seller decides)</h3>
            <p className="mt-2 text-sm bd-ink2 leading-6">
              Timed Offers let buyers place offers during the listing period. At the end, the highest offer is shown to the seller —
              but the seller must explicitly accept to form a sale. There is no automatic “winner”.
            </p>
            <ul className="mt-3 list-disc pl-6 text-sm bd-ink2 space-y-1">
              <li>Best for price discovery or when you want to review the top offer first.</li>
              <li>Buyer: place an offer and wait for seller acceptance.</li>
              <li>Seller: accept the highest offer (or decline/relist).</li>
            </ul>
          </div>
        </section>

        <section className="mt-8">
          <H2>4) Messaging &amp; safety</H2>
          <ul className="mt-2 list-disc pl-6 bd-ink2 space-y-1">
            <li>Use Bidra messages to ask questions and arrange pickup/delivery details.</li>
            <li>Meet in public and inspect items before paying.</li>
            <li>If something feels wrong, report the listing or message thread.</li>
          </ul>
        </section>

        <section className="mt-8">
          <H2>5) Payments</H2>
          <p className="mt-2 text-sm bd-ink2 leading-6">
            Where Bidra provides a payment flow for an order, you’ll be guided through a dedicated Pay Now page.
            This keeps expectations clear and reduces misunderstandings.
          </p>
        </section>

        <section className="mt-8">
          <H2>6) Eligibility</H2>
          <ul className="mt-2 list-disc pl-6 bd-ink2 space-y-1">
            <li>Bidra is 18+ for creating accounts and transacting.</li>
            <li>Restricted accounts cannot list, offer, message, or place orders.</li>
          </ul>
        </section>

        <section className="mt-8">
          <H2>Need help?</H2>
          <p className="mt-2 text-sm bd-ink2">
            Visit <a className="bd-link font-semibold" href="/support">Support &amp; Safety</a> or <a className="bd-link font-semibold" href="/contact">Contact</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
