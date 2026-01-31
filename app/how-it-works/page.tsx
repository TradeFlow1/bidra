import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "How it works — Bidra" };

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

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: any;
}) {
  return (
    <div className="rounded-2xl border bd-bd bg-white p-5 space-y-2">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full border bd-bd bg-white flex items-center justify-center text-sm font-extrabold bd-ink">
          {n}
        </div>
        <div className="text-sm font-extrabold bd-ink">{title}</div>
      </div>
      <div className="text-sm bd-ink2 leading-7">{children}</div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">
            How Bidra works
          </h1>
          <p className="bd-ink2 leading-7">
            Bidra is an Australian marketplace platform. People list items, make offers, and create orders.
            Bidra is not the seller of items listed by users.
          </p>

          <Callout>
            <strong className="bd-ink">Two ways to buy:</strong>{" "}
            <span className="bd-ink2">
              <strong className="bd-ink">Buy Now</strong> creates an order immediately (binding), and{" "}
              <strong className="bd-ink">Timed Offers</strong> are not binding until a seller accepts.
            </span>
          </Callout>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-3">
            <H2>Buy Now (instant order)</H2>
            <div className="grid gap-3">
              <Step n="1" title="Buyer clicks Buy Now">
                An order is created immediately. The buyer agrees to complete payment in the order flow.
              </Step>
              <Step n="2" title="Payment and confirmation">
                Bidra shows the payment instructions and any fees (if applicable) before the buyer confirms.
              </Step>
              <Step n="3" title="Pickup or delivery">
                Buyers and sellers coordinate pickup/delivery details. Keep conversations respectful and safe.
              </Step>
              <Step n="4" title="Complete the order">
                Once the exchange is done, mark the order complete and leave feedback.
              </Step>
            </div>
          </section>

          <section className="space-y-3">
            <H2>Timed Offers (seller decides)</H2>
            <div className="grid gap-3">
              <Step n="1" title="Buyer places an offer">
                Buyers can place offers while the listing is active. This does not create an order yet.
              </Step>
              <Step n="2" title="Seller reviews offers">
                The seller can accept the highest offer (or decline/relist). The seller is always in control.
              </Step>
              <Step n="3" title="If accepted, an order is created">
                When the seller accepts an offer, Bidra creates an order and the buyer proceeds to payment.
              </Step>
            </div>
          </section>

          <section className="space-y-2">
            <H2>Messaging</H2>
            <p className="text-sm bd-ink2 leading-7">
              Use messages to ask questions, confirm pickup, and coordinate. Never share passwords or verification codes.
              If something feels suspicious, use the report tools or contact support.
            </p>
          </section>

          <section className="space-y-2">
            <H2>Safety basics</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>Meet in public places when possible.</li>
              <li>Inspect items before handing over money (or before marking complete).</li>
              <li>Be cautious of urgent pressure, unusual requests, or “too good to be true” deals.</li>
            </ul>
            <p className="text-sm mt-2">
              <Link href="/support" className="bd-link font-semibold">Support &amp; Safety →</Link>
            </p>
          </section>

          <section className="space-y-2">
            <H2>Prohibited items</H2>
            <p className="text-sm bd-ink2 leading-7">
              Some items can’t be listed on Bidra. Attempts to list prohibited items may be blocked.
            </p>
            <p className="text-sm">
              <Link href="/legal/prohibited-items" className="bd-link font-semibold">Prohibited Items →</Link>
            </p>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            This page is a plain-language summary for Australia. For the full rules, read Terms and Privacy.
          </p>
        </div>
      </div>
    </main>
  );
}
