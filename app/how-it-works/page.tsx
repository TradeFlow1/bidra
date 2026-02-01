import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "How it works — Bidra" };

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
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
    <div className="rounded-2xl border bd-bd bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full border bd-bd flex items-center justify-center text-sm font-extrabold bd-ink">
          {n}
        </div>
        <div className="text-sm font-extrabold bd-ink">{title}</div>
      </div>
      <div className="mt-3 text-sm bd-ink2 leading-7">{children}</div>
    </div>
  );
}
function Callout({ children }: { children: any }) {
  return (
    <div className="rounded-xl border bd-bd bg-white p-4 text-sm bd-ink2 leading-7">
      {children}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">How Bidra works</h1>
          <p className="bd-ink2 leading-7">
            Bidra is an Australian marketplace platform where people list items, message each other, make offers,
            and create orders. Items are sold by users — Bidra is the platform only.
          </p>
          <Callout>
            <strong className="bd-ink">Two sale models:</strong>{" "}
            <span className="bd-ink2">
              Bidra supports <strong className="bd-ink">Buy Now</strong> (binding purchase) and{" "}
              <strong className="bd-ink">Timed Offers</strong> (offers are not binding until the seller accepts).
              Bidra is not an auctioneer and does not conduct auctions.
            </span>
          </Callout>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-6">
          <section className="space-y-3">
            <H2>For buyers</H2>
            <div className="grid gap-3">
              <Step n="1" title="Browse and compare">
                Use search and filters to find listings near you. Check photos, condition, and location. If anything looks unsafe or prohibited, report it.
              </Step>
              <Step n="2" title="Message or act">
                You can message a seller to ask questions, or you can use the listing actions (Buy Now or place an offer) depending on the listing type.
              </Step>
              <Step n="3" title="Buy Now (binding purchase)">
                If the seller enabled Buy Now, using it creates an order immediately. Only use Buy Now if you intend to complete payment as directed in the order flow.
              </Step>
              <Step n="4" title="Timed Offers (seller decides)">
                You can place offers during the offer period. Offers are not binding until the seller accepts.
                At the end of the offer period, the seller may accept the highest offer, decline, or relist.
              </Step>
              <Step n="5" title="Pay and complete safely">
                If payment instructions are provided for an order, follow the on-platform order flow.
                For bank transfers (PayID/Osko), treat it like cash — only pay when you’re confident and have clear handover terms.
              </Step>
            </div>
          </section>

          <section className="space-y-3">
            <H2>For sellers</H2>
            <div className="grid gap-3">
              <Step n="1" title="Create a listing">
                Add clear photos and an honest description (condition, defects, and what’s included). Prohibited items are blocked at listing creation.
              </Step>
              <Step n="2" title="Choose how you want to sell">
                <strong className="bd-ink">Buy Now</strong>: you’re pre-authorising a binding purchase at your set price.
                <br />
                <strong className="bd-ink">Timed Offers</strong>: buyers submit offers; you decide whether to accept.
              </Step>
              <Step n="3" title="Communicate and confirm">
                Use Bidra messages to coordinate questions, pickup details, and order steps. Keep records inside Bidra where possible.
              </Step>
              <Step n="4" title="Accept an offer (when you’re ready)">
                For Timed Offers, you explicitly accept an offer to create an order. There is no automatic “winner” language — you remain in control.
              </Step>
              <Step n="5" title="Complete the order">
                After payment and handover, mark the order complete. Use reporting tools if you see abuse, scams, or prohibited behaviour.
              </Step>
            </div>
          </section>

          <section className="space-y-2">
            <H2>Fees, safety, and rules</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>Fees (if applicable) are shown clearly before you confirm actions in the product flow.</li>
              <li>Prohibited items are blocked at listing creation and repeated attempts may lead to restrictions.</li>
              <li>Report scams, harassment, threats, and unsafe listings directly from the listing or message thread.</li>
            </ul>
            <p className="text-sm mt-3">
              <Link href="/legal/fees" className="bd-link font-semibold">Fees →</Link>{" "}
              <span className="bd-ink2">·</span>{" "}
              <Link href="/legal/prohibited-items" className="bd-link font-semibold">Prohibited items →</Link>{" "}
              <span className="bd-ink2">·</span>{" "}
              <Link href="/support" className="bd-link font-semibold">Support &amp; Safety →</Link>
            </p>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            Plain-language overview for Australia. For full rules, see Terms and Privacy.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/sell/new" className="bd-btn bd-btn-primary">Create a listing</Link>
          <Link href="/browse" className="bd-btn bd-btn-outline">Browse listings</Link>
          <Link href="/legal/terms" className="bd-btn bd-btn-outline">Read Terms</Link>
        </div>
      </div>
    </main>
  );
}
