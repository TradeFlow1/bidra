export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bidra | Terms of Use",
};

export default function TermsPage() {
  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Terms of Use</h1>
          <p className="text-sm text-black/70">
            These Terms apply to your use of Bidra (the “Platform”). Bidra is an Australian marketplace platform that provides
            tools for people to post listings, discover items, communicate, make offers, and create orders.{" "}
            <strong>Bidra is not the seller of items listed by users.</strong>
          </p>
          <p className="text-xs text-black/50">
            Effective: {new Date().getFullYear()} • Plain-language summary for convenience only. If anything is unclear, contact us via{" "}
            <a className="bd-link font-semibold" href="/contact">Contact</a>.
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">1) Eligibility and accounts</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li><strong>Adults only:</strong> Bidra accounts are for adults (18+). Under 18s may browse publicly but cannot create accounts, list, offer, message, or transact.</li>
            <li>You must provide accurate information and keep your account secure.</li>
            <li>We may restrict, suspend, or terminate accounts to protect the platform or comply with law.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">2) Bidra’s role (platform only)</h2>
          <p className="text-sm text-black/70">
            Listings are created by users. You are responsible for verifying item details, condition, authenticity, legality, and suitability
            before proceeding. Any deal is between the buyer and the seller.
          </p>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>Bidra does not guarantee listings, users, delivery, payment, or outcomes.</li>
            <li>Bidra is not an auctioneer and does not automatically “award” a winner.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">3) Listings, content, and rules</h2>
          <p className="text-sm text-black/70">
            You must not post prohibited items or use Bidra for scams, harassment, unlawful activity, or attempts to bypass safety systems.
            Prohibited items are blocked at listing creation.
          </p>
          <p className="text-sm">
            See:{" "}
            <a className="bd-link font-semibold" href="/legal/prohibited-items">
              Prohibited items
            </a>
            .
          </p>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>You grant Bidra a non-exclusive licence to host and display your content to operate the platform.</li>
            <li>We may remove content or limit visibility to keep the platform safe or compliant.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">4) Two sales models (Timed Offers vs Buy Now)</h2>
          <div className="rounded-xl border bd-bd bg-white/60 p-4 space-y-3">
            <div>
              <div className="font-extrabold">Timed Offers (non-binding until seller accepts)</div>
              <p className="mt-1 text-sm text-black/70">
                Offers placed during a timed period are not binding. When the timer ends, the seller may choose to proceed with the highest offer
                (which creates an order), or decline/relist. Bidra does not automatically select a buyer or complete a sale.
              </p>
            </div>
            <div>
              <div className="font-extrabold">Buy Now (binding purchase)</div>
              <p className="mt-1 text-sm text-black/70">
                If a listing shows Buy Now, the seller has pre-authorised a binding sale at that price. When a buyer selects Buy Now, an order is created
                and the buyer is expected to pay using the payment options provided for that order.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">5) Payments, cancellations, refunds</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>Where Bidra provides a Pay Now flow for an order, it is the canonical place to follow payment steps and confirm payment.</li>
            <li><strong>Buy Now:</strong> creating an order via Buy Now is binding; buyers are expected to pay and sellers are expected to supply the item as described.</li>
            <li><strong>Timed Offers:</strong> offers are non-binding until the seller proceeds and an order is created; then the order is binding.</li>
            <li>Cancellations and refunds depend on the seller’s agreement and circumstances, unless Bidra provides a specific feature or policy for the order.</li>
            <li>Bidra may apply platform enforcement (e.g., restrictions) for repeated non-payment, scams, or abuse.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">6) Safety, messaging, and reporting</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>Use Bidra messaging to keep a record of communication.</li>
            <li>Do not harass, threaten, or pressure others. Do not request verification codes or sensitive personal info.</li>
            <li>Use reporting tools for suspicious listings or messages.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">7) Disclaimers and limitation</h2>
          <p className="text-sm text-black/70">
            To the extent permitted by law, Bidra provides the platform “as is” and is not liable for user content, user conduct, or outcomes of transactions.
            Nothing in these Terms excludes non-excludable rights under the Australian Consumer Law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">8) Changes</h2>
          <p className="text-sm text-black/70">
            We may update these Terms to improve safety, clarity, or compliance. Continued use of Bidra after an update means you accept the updated Terms.
          </p>
        </section>

        <p className="text-xs text-black/50">
          Questions? Use the{" "}
          <a className="bd-link font-semibold" href="/contact">Contact page</a>{" "}
          or read{" "}
          <a className="bd-link font-semibold" href="/support">Support &amp; Safety</a>.
        </p>
      </div>
    </main>
  );
}
