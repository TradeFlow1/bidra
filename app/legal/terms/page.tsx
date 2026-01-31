export const dynamic = "force-dynamic";

export const metadata = { title: "Terms of Use — Bidra" };

export default function TermsPage() {
  return (
    <main className="bd-container py-8 pb-14">
      <div className="bd-card p-6 space-y-5 max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Use</h1>

        <p className="text-sm text-black/70">
          Bidra is an Australian online marketplace that allows people to list items for sale, make offers,
          and communicate directly. Bidra is a platform only and is not the seller, buyer, auctioneer,
          or payment processor for items listed by users.
        </p>

        <section>
          <h2 className="font-extrabold">1. Eligibility</h2>
          <p className="text-sm text-black/70">
            Bidra accounts are for adults aged 18 years and over. Under 18s may browse publicly but
            cannot create accounts, list items, make offers, message users, or transact.
          </p>
        </section>

        <section>
          <h2 className="font-extrabold">2. Bidra’s role</h2>
          <p className="text-sm text-black/70">
            Listings are created by users. Any transaction is strictly between the buyer and the seller.
            Bidra does not inspect, verify, guarantee, or take ownership of listed items.
          </p>
        </section>

        <section>
          <h2 className="font-extrabold">3. Buying and selling models</h2>
          <p className="text-sm text-black/70">
            <strong>Buy Now</strong> is a binding purchase. When selected, an order is created and the buyer
            is expected to complete payment using the options shown.
          </p>
          <p className="text-sm text-black/70">
            <strong>Timed Offers</strong> allow buyers to place offers during a listing period.
            Offers are not binding. The seller must explicitly accept an offer to create an order.
          </p>
        </section>

        <section>
          <h2 className="font-extrabold">4. Prohibited items & conduct</h2>
          <p className="text-sm text-black/70">
            Prohibited items may not be listed under any circumstances. Accounts may be restricted
            or suspended for misuse, scams, or unlawful activity.
          </p>
        </section>

        <section>
          <h2 className="font-extrabold">5. Payments, cancellations & refunds</h2>
          <p className="text-sm text-black/70">
            Unless Bidra provides a specific payment feature, payment and refunds are handled
            directly between buyer and seller. Bidra records confirmations but does not hold funds
            or guarantee outcomes.
          </p>
        </section>

        <section>
          <h2 className="font-extrabold">6. Enforcement</h2>
          <p className="text-sm text-black/70">
            Bidra may remove content, restrict features, or suspend accounts to protect users
            and platform integrity.
          </p>
        </section>

        <p className="text-xs text-black/50">
          Continued use of Bidra means you accept these Terms.
        </p>
      </div>
    </main>
  );
}
