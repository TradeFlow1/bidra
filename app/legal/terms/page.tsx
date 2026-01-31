export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms of Use — Bidra",
};

function A({ href, children }: { href: string; children: any }) {
  return (
    <a className="bd-link font-semibold" href={href}>
      {children}
    </a>
  );
}

export default function TermsPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Terms of Use</h1>
        <p className="mt-3 text-sm bd-ink2">
          These Terms govern your use of Bidra (the “Platform”). By using Bidra you agree to these Terms.
          If you do not agree, do not use the Platform.
        </p>

        <div className="mt-6 rounded-xl border bd-bd bg-white p-5 space-y-6">
          <div className="text-xs bd-ink2">
            Last updated: {new Date().toLocaleDateString("en-AU")}
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold bd-ink">1) Who we are (platform only)</h2>
            <p className="text-sm bd-ink2">
              Bidra provides tools to create listings, discover items, make offers, message, report problems, and (where enabled)
              complete purchases. <b>Bidra is not the seller of items listed by users</b>. Listings are created and controlled by
              users, and any transaction is between the buyer and the seller.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold bd-ink">2) Eligibility (18+ accounts)</h2>
            <p className="text-sm bd-ink2">
              Bidra accounts are for adults (18+). Under 18s may browse publicly but cannot create accounts, list items, make offers,
              message, or transact on Bidra. We may ask you to confirm your date of birth and may restrict accounts that cannot meet
              this requirement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold bd-ink">3) Accounts, security, and accuracy</h2>
            <ul className="list-disc pl-6 text-sm bd-ink2 space-y-1">
              <li>You are responsible for activity on your account and keeping your login details secure.</li>
              <li>You must provide accurate information and keep your contact/location details reasonably up to date.</li>
              <li>You must not create accounts for others, share accounts, or bypass restrictions.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold bd-ink">4) Listings and user content</h2>
            <ul className="list-disc pl-6 text-sm bd-ink2 space-y-1">
              <li>Sellers are responsible for their listings, including accuracy, condition, authenticity, and legality.</li>
              <li>You must not post misleading, deceptive, infringing, or unlawful content.</li>
              <li>We may remove content or restrict visibility if needed for safety, compliance, or integrity.</li>
            </ul>
            <p className="text-sm bd-ink2">
              Certain items are not allowed at all. See: <A href="/legal/prohibited-items">Prohibited items</A>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold bd-ink">5) Buying and selling models</h2>

            <div className="rounded-xl border bd-bd bg-white/60 p-4">
              <div className="font-extrabold bd-ink">A) Buy Now (binding purchase)</div>
              <p className="mt-2 text-sm bd-ink2">
                If a listing shows <b>Buy Now</b>, the seller has pre-authorised an immediate sale at that price. When a buyer selects
                Buy Now, an order is created and the buyer is expected to pay using the payment options shown for that order.
              </p>
            </div>

            <div className="mt-3 rounded-xl border bd-bd bg-white/60 p-4">
              <div className="font-extrabold bd-ink">B) Timed Offers (non-binding until seller accepts)</div>
              <p className="mt-2 text-sm bd-ink2">
                Timed Offers let buyers place offers during a listing period. When the period ends, Bidra may display the highest offer
                to the seller, but <b>the seller must explicitly accept</b> to form a sale. Bidra does not automatically select a buyer,
                declare a “winner”, or complete a sale.
              </p>
            </div>

            <p className="mt-3 text-sm bd-ink2">
              Buyers and sellers are responsible for verifying details and proceeding safely.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold bd-ink">6) Payments, cancellations, and refunds</h2>
            <p className="text-sm bd-ink2">
              Payment methods depend on the listing/order flow. Where Bidra provides a payment page for an order, follow that page’s
              instructions. Unless Bidra explicitly processes a payment for a specific order, Bidra does not hold funds or guarantee
              outcomes.
            </p>
            <ul className="list-disc pl-6 text-sm bd-ink2 space-y-1">
              <li><b>Buy Now:</b> buyers are expected to pay promptly; sellers should only enable Buy Now if ready to sell at that price.</li>
              <li><b>Timed Offers:</b> offers are not binding until a seller accepts and an order is created.</li>
              <li><b>Cancellations/refunds:</b> depend on seller agreement, platform rules, and the circumstances. If payment has been made,
                any refund is handled by the seller unless Bidra provides a specific refund feature.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold bd-ink">7) Messaging, safety, and reporting</h2>
            <ul className="list-disc pl-6 text-sm bd-ink2 space-y-1">
              <li>Use Bidra messaging to keep a record of communication.</li>
              <li>No harassment, threats, scams, or requests for sensitive information.</li>
              <li>Use reporting tools if something looks unsafe or suspicious.</li>
            </ul>
            <p className="text-sm bd-ink2">
              See: <A href="/support">Support &amp; Safety</A>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold bd-ink">8) Enforcement</h2>
            <p className="text-sm bd-ink2">
              We may remove content, limit features, restrict accounts, or suspend access to protect users, comply with law, or maintain
              platform integrity. This may include repeated attempts to list prohibited items, suspected fraud, or abusive conduct.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold bd-ink">9) Disclaimers and liability</h2>
            <p className="text-sm bd-ink2">
              Bidra is provided “as is” and “as available”. To the extent permitted by law, Bidra is not liable for losses arising from
              user listings, user conduct, transactions, or communications. Nothing in these Terms limits rights you may have under the
              Australian Consumer Law that cannot be excluded.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold bd-ink">10) Changes to these Terms</h2>
            <p className="text-sm bd-ink2">
              We may update these Terms from time to time. Continued use of Bidra after updates means you accept the updated Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold bd-ink">11) Contact</h2>
            <p className="text-sm bd-ink2">
              Questions? Use the <A href="/contact">Contact page</A>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
