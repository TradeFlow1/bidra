export const dynamic = "force-dynamic";

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

export default function FeesPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Fees</h1>
          <p className="bd-ink2 leading-7">
            Bidra is a platform marketplace. If fees apply to a feature (for example, upgrades or on-platform payments),
            we show them clearly before you commit.
          </p>
          <Callout>
            <strong className="bd-ink">Plain rule:</strong> No hidden fees. If there’s a fee, you’ll see it in the flow before you publish or pay.
          </Callout>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-2">
            <H2>1) Browsing and accounts</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>Browsing listings is free.</li>
              <li>Creating an account is free (18+ accounts only).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>2) Listings and selling</H2>
            <p className="text-sm bd-ink2 leading-7">
              If a listing upgrade or paid feature is offered, we’ll show the price before you publish.
              If you don’t choose an upgrade, your listing remains standard and free to post (unless shown otherwise in the product flow).
            </p>
          </section>

          <section className="space-y-3">
            <H2>3) Buying and orders</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>
                <strong className="bd-ink">Buy Now</strong> creates an order immediately. Any payment instructions or fees (if applicable)
                are shown in the order flow.
              </li>
              <li>
                <strong className="bd-ink">Timed Offers</strong> are not binding until a seller accepts an offer. If accepted, an order is created.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>4) Payments</H2>
            <p className="text-sm bd-ink2 leading-7">
              Payment methods can vary over time as Bidra evolves. Where Bidra provides an on-platform payment page,
              users agree to follow the payment flow for orders created on Bidra.
            </p>
          </section>

          <section className="space-y-2">
            <H2>5) Changes to fees</H2>
            <p className="text-sm bd-ink2 leading-7">
              Fees and premium features may change over time. If we introduce or change a fee, we’ll present it clearly in-product
              before you use the feature, and we may update these pages to reflect the current offering.
            </p>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            This page is a plain-language summary for Australia. For rules of use, see Terms. For safety, see Support &amp; Safety.
          </p>
        </div>
      </div>
    </main>
  );
}
