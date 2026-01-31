export const metadata = {
  title: "Prohibited Items — Bidra",
};

function LI({ children }: { children: any }) {
  return <li className="leading-6">{children}</li>;
}

export default function ProhibitedItemsPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Prohibited items</h1>

        <p className="mt-3 text-sm bd-ink2 leading-6">
          Bidra is a local Australian marketplace. Some items and services are not allowed on Bidra — under any circumstances.
          Prohibited items are blocked at listing creation (server-side). There is no “review” path for prohibited items.
        </p>

        <div className="mt-6 rounded-xl border bd-bd bg-white p-6">
          <h2 className="text-lg font-extrabold bd-ink">Not allowed on Bidra</h2>

          <ul className="mt-3 list-disc pl-6 space-y-2 text-sm bd-ink2">
            <LI><strong>Illegal items or services</strong> under Australian law.</LI>
            <LI><strong>Drugs</strong>, drug paraphernalia, or controlled substances.</LI>
            <LI><strong>Weapons</strong>, firearms, ammunition, or weapon components.</LI>
            <LI><strong>Stolen property</strong> or items suspected to be stolen.</LI>
            <LI><strong>Counterfeit/replica/infringing goods</strong> (including fake branded items).</LI>
            <LI><strong>Hazardous materials</strong>, explosives, unsafe chemicals.</LI>
            <LI><strong>Live animals</strong>.</LI>
            <LI><strong>Adult sexual services</strong> or explicit/sexual/fetish content.</LI>
            <LI><strong>Vapes / nicotine products</strong> (including e-cigarettes, nicotine liquid, and related supply items).</LI>
            <LI><strong>Alcohol</strong> listings.</LI>
            <LI><strong>Violence, hate, or exploitation</strong> content.</LI>
            <LI><strong>Misleading, deceptive, or fraudulent listings</strong> (including scams).</LI>
          </ul>

          <p className="mt-6 text-sm bd-ink2 leading-6">
            Listings that violate these rules may be removed and accounts may be restricted or suspended.
            If you see a listing that appears unsafe or prohibited, use the <strong>Report</strong> button on the listing page.
          </p>

          <p className="mt-4 text-sm bd-ink2">
            Need help? Visit{" "}
            <a className="bd-link font-semibold" href="/support">Support &amp; Safety</a>{" "}
            or{" "}
            <a className="bd-link font-semibold" href="/contact">Contact</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
