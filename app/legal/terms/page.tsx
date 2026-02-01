import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Terms of Use — Bidra" };

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}
function H3({ children }: { children: any }) {
  return <h3 className="text-base font-extrabold bd-ink">{children}</h3>;
}
function Callout({ children }: { children: any }) {
  return (
    <div className="rounded-xl border bd-bd bg-white p-4 text-sm bd-ink2 leading-7">
      {children}
    </div>
  );
}
function Bullet({ children }: { children: any }) {
  return <li className="text-sm bd-ink2 leading-7">{children}</li>;
}

export default function TermsPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Terms of Use</h1>
          <p className="bd-ink2 leading-7">
            Bidra is an Australian marketplace platform where users create listings, communicate, make offers,
            and create orders. Bidra is a platform only — Bidra is not the seller, not the buyer, not an auctioneer,
            and does not take ownership of items listed by users.
          </p>
          <Callout>
            <strong className="bd-ink">Plain-language note:</strong>{" "}
            <span className="bd-ink2">
              These terms explain how Bidra works. For privacy and data handling, also read{" "}
              <Link href="/legal/privacy" className="bd-link font-semibold">Privacy →</Link>
            </span>
          </Callout>
          <p className="text-sm bd-ink2 leading-7">
            By using Bidra, you agree to these terms. If you do not agree, do not use the service.
          </p>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-2">
            <H2>1) Definitions</H2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet><strong className="bd-ink">Bidra</strong> means the Bidra website/app and related services.</Bullet>
              <Bullet><strong className="bd-ink">User</strong> means anyone who browses or uses Bidra.</Bullet>
              <Bullet><strong className="bd-ink">Seller</strong> means a user who lists an item.</Bullet>
              <Bullet><strong className="bd-ink">Buyer</strong> means a user who purchases or makes an offer.</Bullet>
              <Bullet><strong className="bd-ink">Listing</strong> means an item posted by a seller.</Bullet>
              <Bullet><strong className="bd-ink">Order</strong> means the order record created by Buy Now or by an accepted offer.</Bullet>
              <Bullet><strong className="bd-ink">Timed Offers</strong> means offers placed during an offer period that are not binding until accepted by the seller.</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>2) Eligibility and accounts</H2>
            <p className="text-sm bd-ink2 leading-7">
              Bidra accounts are for adults aged 18 years and over. Under 18s may browse publicly, but cannot create
              accounts, list items, make offers, message users, or transact.
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>You must provide accurate account information and keep it up to date.</Bullet>
              <Bullet>You are responsible for activity on your account and keeping your login details secure.</Bullet>
              <Bullet>We may restrict or suspend accounts where we reasonably believe there is fraud, abuse, or breach of these terms.</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>3) Bidra’s role (platform-only)</H2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>Users create listings and are responsible for accuracy, photos, condition, pricing, and legality.</Bullet>
              <Bullet>Any sale contract is between the buyer and the seller (the users).</Bullet>
              <Bullet>Bidra does not inspect, verify, guarantee, or warrant items listed by users.</Bullet>
              <Bullet>Bidra may provide tools and guidance, but does not guarantee outcomes or user behaviour.</Bullet>
            </ul>
          </section>

          <section className="space-y-3">
            <H2>4) Sale models on Bidra</H2>

            <div className="space-y-2">
              <H3>Buy Now (binding purchase)</H3>
              <p className="text-sm bd-ink2 leading-7">
                A “Buy Now” listing is intended to be an immediate, binding purchase. Sellers choose to enable Buy Now.
                When a buyer uses Buy Now, an order is created and the buyer is expected to complete payment as directed
                in the order flow.
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <Bullet>Sellers must only enable Buy Now if they genuinely intend to sell at that price.</Bullet>
                <Bullet>Buyers must only use Buy Now if they genuinely intend to complete the purchase.</Bullet>
                <Bullet>Repeated misuse (fake purchases, repeated cancellations, harassment) may lead to restrictions.</Bullet>
              </ul>
            </div>

            <div className="space-y-2">
              <H3>Timed Offers (not binding until seller accepts)</H3>
              <p className="text-sm bd-ink2 leading-7">
                “Timed Offers” allows buyers to submit offers during a listing’s offer period. Offers are not binding until the seller
                explicitly accepts an offer (including the highest offer at the end of the period). The seller controls whether to proceed.
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <Bullet>A seller may accept an offer, decline offers, or relist.</Bullet>
                <Bullet>Once accepted, an order is created and the buyer is expected to proceed.</Bullet>
                <Bullet>Bidra is not an auctioneer and does not conduct auctions.</Bullet>
              </ul>
            </div>

            <p className="text-sm">
              <Link href="/how-it-works" className="bd-link font-semibold">How Bidra works →</Link>
            </p>
          </section>

          <section className="space-y-2">
            <H2>5) Listings and prohibited items</H2>
            <p className="text-sm bd-ink2 leading-7">
              Sellers must list items honestly and include accurate details (including defects). Prohibited items cannot be listed.
              Bidra blocks prohibited items at listing creation, and may remove listings later if detected or reported.
            </p>
            <p className="text-sm">
              <Link href="/legal/prohibited-items" className="bd-link font-semibold">Prohibited items →</Link>
            </p>
          </section>

          <section className="space-y-2">
            <H2>6) Messaging and conduct</H2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>Be respectful. No harassment, threats, hate, or intimidation.</Bullet>
              <Bullet>No scams, impersonation, or attempts to deceive other users.</Bullet>
              <Bullet>Do not request or share passwords, verification codes, or remote access.</Bullet>
              <Bullet>Bidra may review content for moderation where reports occur or abuse is suspected.</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>7) Fees and payments</H2>
            <p className="text-sm bd-ink2 leading-7">
              Bidra may charge fees for certain services (for example, listing upgrades or platform payment processing). Where fees apply,
              they will be shown clearly in the product flow before you confirm.
            </p>
            <p className="text-sm bd-ink2 leading-7">
              Payment methods may vary over time. If Bidra provides an on-platform payment flow for an order, users agree to follow it for
              orders created on Bidra.
            </p>
            <p className="text-sm">
              <Link href="/legal/fees" className="bd-link font-semibold">Fees →</Link>
            </p>
          </section>

          <section className="space-y-2">
            <H2>8) Cancellations, no-shows, and misuse</H2>
            <p className="text-sm bd-ink2 leading-7">
              Buy Now is intended to be binding. If you use Buy Now and then repeatedly cancel, fail to pay, or waste sellers’ time, Bidra may apply restrictions.
              Sellers should also act in good faith and avoid enabling Buy Now when an item is not genuinely available.
            </p>
          </section>

          <section className="space-y-2">
            <H2>9) Reporting, safety, and enforcement</H2>
            <p className="text-sm bd-ink2 leading-7">
              If you see suspicious activity, a prohibited listing, or harassment, report it. Bidra may remove content, restrict features,
              suspend accounts, or take other reasonable actions to protect users and the platform.
            </p>
            <p className="text-sm">
              <Link href="/support" className="bd-link font-semibold">Support &amp; Safety →</Link>
            </p>
          </section>

          <section className="space-y-2">
            <H2>10) Intellectual property and content licence</H2>
            <p className="text-sm bd-ink2 leading-7">
              You own the content you submit. By posting content (including photos and text), you grant Bidra a worldwide, non-exclusive licence
              to host, display, reproduce, and process it to operate and improve the marketplace, including moderation and safety review.
            </p>
            <p className="text-sm bd-ink2 leading-7">
              Do not post content you do not have rights to use (including copyrighted photos or counterfeit branding).
            </p>
          </section>

          <section className="space-y-2">
            <H2>11) Disputes between users</H2>
            <p className="text-sm bd-ink2 leading-7">
              Most disputes are best resolved directly between buyer and seller. Bidra may provide tools, reporting, and account enforcement,
              but Bidra is not a party to the sale contract between users.
            </p>
          </section>

          <section className="space-y-2">
            <H2>12) Disclaimer and limitation of liability</H2>
            <p className="text-sm bd-ink2 leading-7">
              Bidra provides the platform “as is”. To the extent permitted by law, Bidra disclaims warranties and is not liable for losses arising
              from user-to-user transactions, listings, messages, or conduct. Nothing in these terms excludes rights you may have under Australian
              Consumer Law that cannot be excluded.
            </p>
          </section>

          <section className="space-y-2">
            <H2>13) Termination</H2>
            <p className="text-sm bd-ink2 leading-7">
              You may stop using Bidra at any time. Bidra may suspend or terminate access where we reasonably believe you have breached these terms,
              created risk, or engaged in fraud/abuse.
            </p>
          </section>

          <section className="space-y-2">
            <H2>14) Changes</H2>
            <p className="text-sm bd-ink2 leading-7">
              We may update these terms from time to time. If changes are significant, we’ll take reasonable steps to notify users. Continued use
              of Bidra after changes means you accept the updated terms.
            </p>
          </section>

          <section className="space-y-2">
            <H2>15) Contact</H2>
            <p className="text-sm bd-ink2 leading-7">
              For questions about these terms, use the Contact page.
            </p>
            <p className="text-sm">
              <Link href="/contact" className="bd-link font-semibold">Contact →</Link>
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
