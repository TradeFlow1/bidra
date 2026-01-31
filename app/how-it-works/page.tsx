export const metadata = {
  title: "How Bidra Works — Bidra",
};

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}
function Callout({ children }: { children: any }) {
  return (
    <div className="rounded-xl border bd-bd bg-white p-4 text-sm bd-ink2 leading-7">
      {children}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">How Bidra works</h1>
          <p className="bd-ink2 leading-7">
            Bidra is an Australian marketplace where people list items and connect directly. We provide tools to browse,
            message safely, make offers, and complete purchases with clear order flows.
          </p>
          <Callout>
            <strong className="bd-ink">Important:</strong> Bidra is a platform only. Items are sold by users. We are not the seller or an auctioneer.
          </Callout>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-2">
            <H2>1) Browse & search</H2>
            <ul className="mt-2 list-disc pl-6 bd-ink2 text-sm leading-7 space-y-1">
              <li>Search listings by keyword and filter by location, price, and category.</li>
              <li>Open a listing to see photos, details, condition, and the available purchase options.</li>
              <li>Use Watchlist to save items and come back later.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>2) Sell: create a listing</H2>
            <ul className="mt-2 list-disc pl-6 bd-ink2 text-sm leading-7 space-y-1">
              <li>Add clear photos and an honest description (include defects).</li>
              <li>Include your suburb/state/postcode so buyers can make informed decisions.</li>
              <li>Choose a sale type: Buy Now or Timed Offers.</li>
            </ul>
            <p className="mt-3 text-sm bd-ink2 leading-7">
              Prohibited items are blocked at listing creation — if something is unsafe or prohibited, it cannot be listed.
            </p>
          </section>

          <section className="space-y-3">
            <H2>3) Choose a sale type</H2>

            <div className="space-y-2">
              <h3 className="font-extrabold bd-ink">Buy Now</h3>
              <p className="text-sm bd-ink2 leading-7">
                Buy Now is designed for an immediate purchase at a fixed price. When a buyer uses Buy Now, an order is created
                and the buyer is expected to complete payment as directed.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold bd-ink">Timed Offers</h3>
              <p className="text-sm bd-ink2 leading-7">
                Timed Offers allows buyers to submit offers during the offer period. Offers are not final until the seller explicitly accepts.
                At the end of the offer period, the seller may accept the highest offer (or decline/relist).
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <H2>4) Messaging & meetups</H2>
            <ul className="mt-2 list-disc pl-6 bd-ink2 text-sm leading-7 space-y-1">
              <li>Use Bidra messages to confirm details, pickup times, and questions about the item.</li>
              <li>Meet in a public place when possible and inspect items before confirming completion.</li>
              <li>If anything feels suspicious, report the listing or message thread.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>5) Orders, completion, and feedback</H2>
            <ul className="mt-2 list-disc pl-6 bd-ink2 text-sm leading-7 space-y-1">
              <li>When a purchase is made (Buy Now) or an offer is accepted, an order is created.</li>
              <li>After the exchange, complete the order so both sides have a clear record.</li>
              <li>Leave feedback to help build trust in the marketplace.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>6) Safety and moderation</H2>
            <p className="text-sm bd-ink2 leading-7">
              Bidra uses reporting, moderation, and enforcement to keep the platform safe. If you see a prohibited item, harassment,
              or a scam attempt, report it — we review reports and take action when needed.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
