export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bidra | Terms of Use",
};

export default function TermsPage() {
  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-6 space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Terms of Use</h1>
        <p className="text-sm text-black/70">
          These Terms apply to your use of Bidra. Bidra is an Australian marketplace platform that
          helps people discover listings and contact each other. Bidra is not the seller of items
          listed by users.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">1) Eligibility</h2>
          <p className="text-sm text-black/70">
            Bidra accounts are 18+. Under 18s may browse publicly but cannot create accounts, list,
            offer, message, or transact on Bidra.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">2) Platform role (not the seller)</h2>
          <p className="text-sm text-black/70">
            Listings are created by users. You are responsible for verifying items, descriptions,
            condition, authenticity, and suitability before proceeding. Any deal is made between
            buyer and seller.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">3) Prohibited items and conduct</h2>
          <p className="text-sm text-black/70">
            You must not list prohibited items or use Bidra for scams, harassment, or unlawful
            activity. We may remove content, restrict accounts, or take enforcement actions to keep
            the platform safe.
          </p>
          <p className="text-sm">
            See:{" "}
            <a className="bd-link" href="/legal/prohibited-items">
              Prohibited items
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">4) Offers and “Buy now” language</h2>
          <p className="text-sm text-black/70">
            Bidra may show “top offer” and timed offers mechanics. Bidra does not automatically
            determine a winner or bind a sale. At the end of a offers period, the seller decides
            whether to proceed with the highest offer.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">5) Safety and communications</h2>
          <p className="text-sm text-black/70">
            Keep personal information minimal until you’re confident. Use Bidra reporting tools if a
            listing or user concerns you.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">6) Changes</h2>
          <p className="text-sm text-black/70">
            We may update these Terms to improve safety and clarity. Continued use of Bidra after a
            change means you accept the updated Terms.
          </p>
        </section>

        <p className="text-xs text-black/50">
          This is a plain-language summary for beta. We’ll expand these Terms before a broader
          public launch.
        </p>
      </div>
    </main>
  );
}
