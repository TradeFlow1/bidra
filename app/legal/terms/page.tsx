export const dynamic = "force-dynamic";

export const metadata = { title: "Terms of Use — Bidra" };

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}
function H3({ children }: { children: any }) {
  return <h3 className="text-base font-extrabold bd-ink">{children}</h3>;
}

export default function TermsPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Terms of Use</h1>
          <p className="bd-ink2 leading-7">
            Bidra is an Australian online marketplace where people list items, communicate, make offers, and buy.
            Bidra is a platform only — Bidra is not the seller, not the buyer, not an auctioneer, and does not take ownership of listed items.
          </p>
          <p className="text-sm bd-ink2">
            By using Bidra, you agree to these terms. If you do not agree, do not use the service.
          </p>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-2">
            <H2>1) Eligibility</H2>
            <p className="text-sm bd-ink2 leading-7">
              Bidra accounts are for adults aged 18 years and over. Under 18s may browse publicly, but cannot create
              accounts, list items, make offers, message users, or transact.
            </p>
          </section>

          <section className="space-y-2">
            <H2>2) Bidra’s role (platform-only)</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>Users create listings and are responsible for their accuracy.</li>
              <li>Any sale is between the buyer and the seller (the users).</li>
              <li>Bidra does not inspect, verify, guarantee, or warrant items listed by users.</li>
              <li>Bidra may provide tools and guidance, but does not guarantee outcomes or user behaviour.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <H2>3) Sale models on Bidra</H2>

            <div className="space-y-2">
              <H3>Buy Now (binding purchase)</H3>
              <p className="text-sm bd-ink2 leading-7">
                A “Buy Now” listing is intended to be an immediate, binding purchase. Sellers choose to enable Buy Now.
                When a buyer uses Buy Now, an order is created and the buyer is expected to complete payment as directed.
              </p>
              <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
                <li>Sellers must only enable Buy Now if they genuinely intend to sell at that price.</li>
                <li>Buyers must only use Buy Now if they genuinely intend to complete the purchase.</li>
                <li>Bidra may restrict accounts that repeatedly misuse Buy Now (e.g., fake purchases or repeated cancellations).</li>
              </ul>
            </div>

            <div className="space-y-2">
              <H3>Timed Offers (non-binding until seller accepts)</H3>
              <p className="text-sm bd-ink2 leading-7">
                “Timed Offers” allows buyers to submit offers during a listing’s offer period. Offers are not binding until the seller
                explicitly accepts an offer (including the highest offer at the end of the period). No automatic “winner” language applies.
                The seller controls whether to proceed.
              </p>
              <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
                <li>A seller may accept an offer, decline offers, or relist.</li>
                <li>Once accepted, an order is created and the buyer is expected to proceed.</li>
                <li>Bidra is not an auctioneer and does not conduct auctions.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-2">
            <H2>4) User responsibilities</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>Provide accurate account information and keep it updated.</li>
              <li>List items honestly (condition, defects, photos, and key details).</li>
              <li>Do not list prohibited items (see the Prohibited Items page).</li>
              <li>Communicate respectfully and do not harass, scam, or pressure other users.</li>
              <li>Do not attempt to interfere with the platform (abuse, scraping, hacking, or fraud).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>5) Fees and payments</H2>
            <p className="text-sm bd-ink2 leading-7">
              Bidra may charge fees for certain services (for example, listing upgrades or platform payments).
              Where fees apply, they will be shown clearly in the product flow.
            </p>
            <p className="text-sm bd-ink2 leading-7">
              Payment methods may vary over time. If Bidra provides an on-platform payment flow, users agree to follow it for orders created on Bidra.
            </p>
          </section>

          <section className="space-y-2">
            <H2>6) Safety, reporting, and enforcement</H2>
            <p className="text-sm bd-ink2 leading-7">
              If you see suspicious activity, a prohibited listing, or harassment, report it. Bidra may remove content,
              restrict features, suspend accounts, or take other reasonable actions to protect users and the platform.
            </p>
          </section>

          <section className="space-y-2">
            <H2>7) Content and messaging</H2>
            <p className="text-sm bd-ink2 leading-7">
              You own the content you submit, but you grant Bidra a licence to host, display, and process it to operate the marketplace.
              Bidra may review messages and content for moderation when reports occur or abuse is suspected.
            </p>
          </section>

          <section className="space-y-2">
            <H2>8) Disputes between users</H2>
            <p className="text-sm bd-ink2 leading-7">
              Most disputes are best resolved directly between buyer and seller. Bidra may provide tools, reporting, and account enforcement,
              but Bidra is not a party to the sale contract between users.
            </p>
          </section>

          <section className="space-y-2">
            <H2>9) Disclaimer and limitation of liability</H2>
            <p className="text-sm bd-ink2 leading-7">
              Bidra provides the platform “as is”. To the extent permitted by law, Bidra disclaims warranties and is not liable for
              losses arising from user-to-user transactions, listings, messages, or conduct. Nothing in these terms excludes
              rights you may have under Australian Consumer Law that cannot be excluded.
            </p>
          </section>

          <section className="space-y-2">
            <H2>10) Termination</H2>
            <p className="text-sm bd-ink2 leading-7">
              You may stop using Bidra at any time. Bidra may suspend or terminate access where we reasonably believe you have
              breached these terms, created risk, or engaged in fraud/abuse.
            </p>
          </section>

          <section className="space-y-2">
            <H2>11) Changes</H2>
            <p className="text-sm bd-ink2 leading-7">
              We may update these terms from time to time. If changes are significant, we’ll take reasonable steps to notify users.
              Continued use of Bidra after changes means you accept the updated terms.
            </p>
          </section>

          <section className="space-y-2">
            <H2>12) Contact</H2>
            <p className="text-sm bd-ink2 leading-7">
              For questions about these terms, use the Contact page.
            </p>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            These terms are intended for use in Australia. Governing law is Australia (and any mandatory local rules apply).
          </p>
        </div>
      </div>
    </main>
  );
}
