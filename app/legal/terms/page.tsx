export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms of Use — Bidra",
};

function L({ children }: { children: any }) {
  return <p className="text-sm bd-ink2 leading-6">{children}</p>;
}

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}

export default function TermsPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Terms of Use</h1>
        <p className="mt-2 text-sm bd-ink2">
          These Terms apply to your use of Bidra (including browsing, creating an account, listing, offers, messaging,
          and any order flows). Bidra is an Australian marketplace platform. Bidra is not the seller of items listed by users.
        </p>

        <div className="mt-6 rounded-xl border bd-bd bg-white p-6 space-y-6">
          <section className="space-y-2">
            <H2>1) Who can use Bidra</H2>
            <L>
              Bidra accounts are for adults (18+). Under 18s may browse publicly, but cannot create accounts, list items,
              place offers, message, or transact on Bidra.
            </L>
            <L>
              You must provide accurate information and keep your account details up to date. You are responsible for activity
              on your account.
            </L>
          </section>

          <section className="space-y-2">
            <H2>2) Bidra’s role (platform only)</H2>
            <L>
              Bidra provides tools to publish listings, search, message, make offers, and create orders. Listings are created by users.
              Bidra is not a party to your deal unless a Bidra feature explicitly says otherwise.
            </L>
            <L>
              You are responsible for verifying item details, condition, authenticity, legality, suitability, and safe exchange arrangements.
            </L>
          </section>

          <section className="space-y-2">
            <H2>3) Listings, accuracy, and prohibited items</H2>
            <L>
              Listings must be accurate and not misleading. You must not list prohibited items or use Bidra for scams, harassment,
              unlawful activity, or attempts to evade platform rules.
            </L>
            <L>
              Prohibited items are blocked at listing creation. Repeated attempts may result in restrictions.
            </L>
            <p className="text-sm">
              See:{" "}
              <a className="bd-link font-semibold" href="/legal/prohibited-items">
                Prohibited items
              </a>
              .
            </p>
          </section>

          <section className="space-y-2">
            <H2>4) Messaging and conduct</H2>
            <L>
              Use Bidra messaging to keep a clear record and to help safety reviews if needed. Do not harass, threaten, or pressure others.
              Do not request verification codes or passwords. Do not attempt to circumvent safety systems.
            </L>
            <L>
              You may report listings or message threads. We may review and take action to keep the platform safe.
            </L>
          </section>

          <section className="space-y-2">
            <H2>5) Two sales models: Buy Now vs Timed Offers</H2>
            <L>
              <strong>Timed Offers:</strong> Timed Offers are non-binding offers. At the end of the offer period, the highest offer may be shown
              to the seller, but the seller must explicitly accept to form a sale. There is no automatic “winner”.
            </L>
            <L>
              <strong>Buy Now:</strong> Buy Now is a binding purchase path. The seller pre-authorises the sale at the Buy Now price. When a buyer uses
              Buy Now, an order is created and the buyer is expected to pay using the payment options shown for that order.
            </L>
            <L>
              Bidra uses neutral marketplace language and does not act as an auctioneer. Bidra does not automatically “award” items.
            </L>
          </section>

          <section className="space-y-2">
            <H2>6) Orders, payment, cancellations, refunds</H2>
            <L>
              When an order is created (via Buy Now or seller acceptance of an offer), the buyer is expected to pay using the payment options provided for that order.
              Sellers should only enable Buy Now if ready to sell at that price.
            </L>
            <L>
              Unless a specific Bidra feature says otherwise, buyers and sellers arrange pickup/postage, inspection, and any refunds between themselves.
              Bidra may record confirmations and enforce platform rules, but does not guarantee outcomes.
            </L>
            <L>
              Cancellations are not guaranteed and depend on seller agreement and circumstances. Where a refund is agreed, it should be made using the same method
              the buyer used, unless Bidra provides a dedicated refund feature.
            </L>
          </section>

          <section className="space-y-2">
            <H2>7) Fees and pricing</H2>
            <L>
              Some features may carry fees (for example, listing upgrades or transaction-related fees). Fees will be shown before you commit.
              If a fee applies, you agree to pay it as described.
            </L>
            <p className="text-sm">
              See:{" "}
              <a className="bd-link font-semibold" href="/legal/fees">
                Fees
              </a>
              .
            </p>
          </section>

          <section className="space-y-2">
            <H2>8) Safety and risk</H2>
            <L>
              Marketplace transactions carry risk. Use common sense: meet in public, verify identity where appropriate,
              inspect items before paying, and avoid pressure or urgency. If something feels wrong, report it and step away.
            </L>
            <p className="text-sm">
              See:{" "}
              <a className="bd-link font-semibold" href="/support">
                Support &amp; Safety
              </a>
              .
            </p>
          </section>

          <section className="space-y-2">
            <H2>9) Content, intellectual property</H2>
            <L>
              You retain ownership of content you create, but you grant Bidra a licence to host, display, and distribute it as needed
              to operate the service (for example, showing your listing to other users). You must not upload content you don’t have rights to use.
            </L>
          </section>

          <section className="space-y-2">
            <H2>10) Enforcement, restrictions, termination</H2>
            <L>
              We may remove content, restrict accounts, or suspend access to keep Bidra safe and compliant. Restrictions may be temporary or permanent depending on severity and history.
            </L>
            <L>
              You can stop using Bidra at any time. We may retain certain records for legal, safety, and fraud-prevention reasons.
            </L>
          </section>

          <section className="space-y-2">
            <H2>11) Disclaimers and liability (platform only)</H2>
            <L>
              Bidra does not verify every listing or user. To the maximum extent permitted by law, Bidra is not responsible for user content, conduct,
              or outcomes of transactions between users. Nothing in these Terms excludes rights you have under Australian Consumer Law.
            </L>
          </section>

          <section className="space-y-2">
            <H2>12) Governing law</H2>
            <L>
              These Terms are governed by the laws of Australia. Where disputes arise, we encourage users to first try to resolve issues directly and respectfully.
            </L>
          </section>

          <p className="text-xs bd-ink2">
            Questions? Use{" "}
            <a className="bd-link font-semibold" href="/contact">
              Contact
            </a>{" "}
            or{" "}
            <a className="bd-link font-semibold" href="/feedback">
              Feedback
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
