import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Fees — Bidra" };

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
function Bullet({ children }: { children: any }) {
  return <li className="text-sm bd-ink2 leading-7">{children}</li>;
}

export default function FeesPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Fees</h1>
          <p className="bd-ink2 leading-7">
            This page explains how Bidra fees work (if applicable). Any fee that applies will be shown clearly in the product flow
            before you confirm an action.
          </p>
          <Callout>
            <strong className="bd-ink">Key rule:</strong>{" "}
            <span className="bd-ink2">
              We don’t hide fees. If a fee applies, you’ll see it before confirming (for example on an order/payment page).
            </span>
          </Callout>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-2">
            <H2>1) Possible fee types</H2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet><strong className="bd-ink">Transaction/platform fee:</strong> may apply to completed orders created on Bidra (e.g., a percentage of the sale price).</Bullet>
              <Bullet><strong className="bd-ink">Payment processing fee:</strong> may apply if a payment provider is used in-platform.</Bullet>
              <Bullet><strong className="bd-ink">Optional upgrades:</strong> featured placement or other listing upgrades (if offered).</Bullet>
            </ul>
            <p className="text-sm bd-ink2 leading-7">
              If fees are introduced or changed, the latest fee details will be shown here and inside the relevant flow.
            </p>
          </section>

          <section className="space-y-2">
            <H2>2) When fees apply</H2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>Fees (if applicable) generally apply to <strong className="bd-ink">completed orders</strong> created through Buy Now or accepted offers.</Bullet>
              <Bullet>Fees do not apply to simple browsing or messaging.</Bullet>
              <Bullet>Any upgrades are optional and shown before purchase.</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>3) Examples (illustrative)</H2>
            <p className="text-sm bd-ink2 leading-7">
              Examples below are illustrative only. Your actual totals depend on the fees shown at the time and in the order flow.
            </p>
            <div className="rounded-xl border bd-bd bg-white p-4 text-sm bd-ink2 leading-7">
              <div className="font-extrabold bd-ink text-sm">Example A — Percentage platform fee</div>
              <div className="mt-1">
                If a platform fee of <strong className="bd-ink">7%</strong> applied to a $100 order:
                <br />
                Platform fee = $100 × 0.07 = $7.00
              </div>
              <div className="mt-3 font-extrabold bd-ink text-sm">Example B — Fixed + percentage processing</div>
              <div className="mt-1">
                If payment processing was <strong className="bd-ink">1.5%</strong> + <strong className="bd-ink">$0.30</strong> on $100:
                <br />
                Processing = ($100 × 0.015) + $0.30 = $1.80
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <H2>4) Fees and disputes</H2>
            <p className="text-sm bd-ink2 leading-7">
              Bidra is a platform marketplace; sales are between users. Fees (if applicable) relate to the platform service and may depend on order status.
              For safety guidance and reporting, see Support &amp; Safety.
            </p>
            <p className="text-sm">
              <Link href="/support" className="bd-link font-semibold">Support &amp; Safety →</Link>
            </p>
          </section>

          <section className="space-y-2">
            <H2>5) Questions</H2>
            <p className="text-sm bd-ink2 leading-7">
              If you have a question about a specific fee shown in a flow, contact support and include the order link.
            </p>
            <p className="text-sm">
              <Link href="/contact" className="bd-link font-semibold">Contact →</Link>
            </p>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            Plain-language summary for Australia. Fees shown in-product take priority if there’s any discrepancy.
          </p>
        </div>

        <p className="text-xs bd-ink2 opacity-70">
          Related: <Link href="/legal/terms" className="bd-link font-semibold">Terms</Link> ·{" "}
          <Link href="/legal/privacy" className="bd-link font-semibold">Privacy</Link>
        </p>
      </div>
    </main>
  );
}
