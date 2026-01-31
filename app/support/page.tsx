import Link from "next/link";

export const metadata = {
  title: "Bidra | Support & Safety",
};

export default function SupportPage() {
  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-6 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Support &amp; Safety</h1>
          <p className="text-black/70">
            Bidra is an Australian marketplace platform. We want every interaction to feel safe.
            If something looks wrong, report it — we take safety seriously.
          </p>
        </header>

        <section className="space-y-3" id="safety">
          <h2 className="text-xl font-semibold">Safety basics</h2>
          <ul className="list-disc space-y-1 pl-5 text-black/75">
            <li>Meet in a public place or bring someone with you.</li>
            <li>Inspect items before paying. Don’t rely on photos alone.</li>
            <li>Keep personal information minimal until you’re confident.</li>
            <li>Keep communication on Bidra to preserve a record.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Common scam signals</h2>
          <ul className="list-disc space-y-1 pl-5 text-black/75">
            <li>Pressure or urgency: “pay now or I’ll sell to someone else”.</li>
            <li>Requests for verification codes, passwords, or identity documents.</li>
            <li>Offers that feel too good to be true, or inconsistent details.</li>
            <li>Trying to move you off-platform immediately.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Reporting</h2>
          <p className="text-black/70">
            Use the <strong>Report</strong> button on a listing or message thread. Reports help us remove prohibited items,
            stop scams, and restrict abusive accounts.
          </p>
          <p className="text-black/70">
            For prohibited items, see{" "}
            <a className="bd-link font-semibold" href="/legal/prohibited-items">Prohibited items</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Buying and selling guidance</h2>
          <ul className="list-disc space-y-1 pl-5 text-black/75">
            <li>Read the listing carefully and ask questions before committing.</li>
            <li>For Buy Now orders, buyers are expected to pay and sellers are expected to supply as described.</li>
            <li>For Timed Offers, offers are non-binding until the seller accepts and an order is created.</li>
          </ul>
          <p className="text-sm text-black/70">
            Learn more: <a className="bd-link font-semibold" href="/how-it-works">How it works</a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Need more help?</h2>
          <div className="flex flex-wrap gap-2">
            <Link className="bd-btn bd-btn-outline" href="/feedback">Feedback</Link>
            <Link className="bd-btn bd-btn-outline" href="/contact">Contact</Link>
            <Link className="bd-btn bd-btn-outline" href="/legal/terms">Terms</Link>
            <Link className="bd-btn bd-btn-outline" href="/legal/privacy">Privacy</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
