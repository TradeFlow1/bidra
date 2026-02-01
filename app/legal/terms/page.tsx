import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Terms & Conditions — Bidra" };

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}
function H3({ children }: { children: any }) {
  return <h3 className="text-base font-extrabold bd-ink">{children}</h3>;
}
function P({ children }: { children: any }) {
  return <p className="text-sm bd-ink2 leading-7">{children}</p>;
}
function Li({ children }: { children: any }) {
  return <li className="text-sm bd-ink2 leading-7">{children}</li>;
}

const SUPPORT_EMAIL = "support@bidra.com.au";

export default function TermsPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Terms &amp; Conditions</h1>
          <P>
            These Terms govern your use of Bidra. By accessing or using Bidra, you agree to these Terms.
            If you do not agree, do not use the platform.
          </P>

          <div className="rounded-xl border bd-bd bg-white p-4 text-sm bd-ink2 leading-7">
            <div>
              <span className="font-semibold bd-ink">Effective:</span> {today}
            </div>
            <div className="mt-1">
              <span className="font-semibold bd-ink">Support:</span>{" "}
              <a className="bd-link font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-2">
            <H2>1) What Bidra is</H2>
            <P>
              Bidra is an Australian marketplace platform. Users create listings and interact through messaging, offers, and orders.
              Unless clearly stated otherwise, Bidra is not the seller of items listed by users and does not take ownership of items.
            </P>
          </section>

          <section className="space-y-2">
            <H2>2) Eligibility (18+)</H2>
            <P>
              Bidra accounts are for users aged 18+. Under 18s may be able to browse public pages but cannot create accounts, message,
              list items, make offers, or transact. We may restrict or remove accounts that do not meet eligibility.
            </P>
          </section>

          <section className="space-y-3">
            <H2>3) Your account</H2>
            <ul className="list-disc pl-6 space-y-1">
              <Li>You are responsible for keeping your login details secure and for activity on your account.</Li>
              <Li>You must provide accurate information and keep it reasonably up to date.</Li>
              <Li>You must not impersonate others or use Bidra for unlawful purposes.</Li>
            </ul>
          </section>

          <section className="space-y-3">
            <H2>4) Listings and content</H2>
            <P>When you create a listing, you are responsible for:</P>
            <ul className="list-disc pl-6 space-y-1">
              <Li>Accurate descriptions and photos (condition, faults, inclusions, and any relevant safety info).</Li>
              <Li>Having the right to sell the item.</Li>
              <Li>Complying with Bidra rules and Australian law.</Li>
            </ul>
            <P>
              Prohibited items are not allowed and may be blocked at listing creation. See{" "}
              <Link href="/legal/prohibited-items" className="bd-link font-semibold">
                Prohibited Items →
              </Link>
              .
            </P>
          </section>

          <section className="space-y-3">
            <H2>5) Messaging and safety</H2>
            <P>
              You are responsible for your communications. Harassment, threats, scams, and abusive behaviour are prohibited.
              Bidra may review messages and listings where needed to investigate reports and enforce safety.
            </P>
            <P>
              If you feel unsafe, stop engaging and report the listing or thread. See{" "}
              <Link href="/support" className="bd-link font-semibold">
                Support &amp; Safety →
              </Link>
              .
            </P>
          </section>

          <section className="space-y-3">
            <H2>6) Offers and orders</H2>

            <div className="space-y-2">
              <H3>Timed Offers (seller acceptance required)</H3>
              <P>
                For Timed Offers, buyers can place offers up to the end time. The highest offer is not automatically binding on the seller.
                A sale only forms if the seller explicitly accepts an offer after the offer period ends (or accepts earlier where allowed).
              </P>
            </div>

            <div className="space-y-2">
              <H3>Buy Now (binding purchase)</H3>
              <P>
                For Buy Now listings, the seller pre-authorises an instant purchase. When a buyer uses Buy Now, an order is created immediately
                and the buyer is expected to complete payment/collection according to the order instructions.
              </P>
              <P>
                Sellers should only enable Buy Now if they are ready to sell at the stated price. Buyers should only use Buy Now if they intend to purchase.
              </P>
            </div>

            <div className="space-y-2">
              <H3>Payments and handover</H3>
              <P>
                Payment methods and handover terms depend on the listing and the order flow shown in Bidra. Bank transfers (PayID/Osko) can be difficult to reverse.
                Use caution, keep records, and avoid paying where you suspect a scam.
              </P>
              <P>
                Fees may apply to completed orders. See{" "}
                <Link href="/legal/fees" className="bd-link font-semibold">
                  Fees →
                </Link>
                .
              </P>
            </div>
          </section>

          <section className="space-y-3">
            <H2>7) Fees</H2>
            <P>
              Bidra may charge fees for certain completed transactions or services. Any applicable fees should be shown in the platform and in the fees page.
            </P>
            <P>
              See{" "}
              <Link href="/legal/fees" className="bd-link font-semibold">
                Fees →
              </Link>
              .
            </P>
          </section>

          <section className="space-y-3">
            <H2>8) Reports, enforcement, and restrictions</H2>
            <P>
              Users can report listings and message threads. Bidra may remove content, suspend listings, restrict accounts, or take other actions
              where we believe it’s necessary to keep the platform safe or comply with law.
            </P>
            <P>
              We aim to apply enforcement fairly, but we may act quickly where safety or legality is at risk.
            </P>
          </section>

          <section className="space-y-2">
            <H2>9) Disclaimers</H2>
            <P>
              Bidra provides a platform. We do not guarantee the quality, safety, legality, or accuracy of user listings.
              You are responsible for your decisions and interactions. Use caution and common sense, especially for high-value items.
            </P>
          </section>

          <section className="space-y-2">
            <H2>10) Limitation of liability</H2>
            <P>
              To the extent permitted by law, Bidra is not liable for indirect or consequential loss, loss of profits, or loss of data arising from your use of the platform.
              Nothing in these Terms excludes consumer guarantees that cannot be excluded under Australian law.
            </P>
          </section>

          <section className="space-y-2">
            <H2>11) Intellectual property</H2>
            <P>
              Bidra and its branding are owned by us. You retain rights to your content, but you grant Bidra a licence to host, display, and distribute your content
              for operating the platform (for example, showing your listing and photos).
            </P>
          </section>

          <section className="space-y-2">
            <H2>12) Changes to these Terms</H2>
            <P>
              We may update these Terms from time to time. We’ll post the updated Terms on this page and update the effective date.
              Continued use of Bidra after changes means you accept the updated Terms.
            </P>
          </section>

          <section className="space-y-2">
            <H2>13) Governing law</H2>
            <P>
              These Terms are governed by the laws applicable in Australia. Where disputes arise, we encourage users to try to resolve issues directly first.
              If you need help, contact us.
            </P>
          </section>

          <section className="space-y-2">
            <H2>Related pages</H2>
            <ul className="list-disc pl-6 space-y-1">
              <Li>
                <Link href="/legal/privacy" className="bd-link font-semibold">
                  Privacy Policy →
                </Link>
              </Li>
              <Li>
                <Link href="/legal/prohibited-items" className="bd-link font-semibold">
                  Prohibited Items →
                </Link>
              </Li>
              <Li>
                <Link href="/contact" className="bd-link font-semibold">
                  Contact →
                </Link>
              </Li>
            </ul>
          </section>
        </div>

        <p className="text-xs bd-ink2 opacity-70">
          These Terms are provided in plain English for a marketplace platform. Some rights and obligations may vary depending on your situation and Australian law.
        </p>
      </div>
    </main>
  );
}
