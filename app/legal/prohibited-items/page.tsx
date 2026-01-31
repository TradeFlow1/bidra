export const metadata = { title: "Prohibited Items — Bidra" };

export default function ProhibitedItemsPage() {
  return (
    <main className="bd-container py-8">
      <div className="bd-card p-6 max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Prohibited Items</h1>

        <p className="text-sm text-black/70">
          The following items cannot be listed on Bidra under any circumstances.
        </p>

        <ul className="list-disc pl-6 text-sm text-black/70 space-y-1">
          <li>Illegal items or services</li>
          <li>Drugs, vapes, or controlled substances</li>
          <li>Weapons or weapon components</li>
          <li>Stolen or counterfeit goods</li>
          <li>Hazardous materials</li>
          <li>Live animals</li>
          <li>Adult sexual services or explicit content</li>
          <li>Fraudulent or misleading listings</li>
        </ul>

        <p className="text-sm text-black/70">
          Listings that violate these rules are removed and accounts may be restricted or suspended.
        </p>
      </div>
    </main>
  );
}
