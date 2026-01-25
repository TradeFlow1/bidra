export const metadata = {
  title: "Prohibited Items — Bidra",
};

export default function ProhibitedItemsPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Prohibited items</h1>

        <p className="mt-3 text-sm bd-ink2">
          Bidra is a platform for listing items locally in Australia. Some items are not allowed to be listed on Bidra.
          Under any circumstances.
        </p>

        <div className="mt-6 bd-card p-6">
          <ul className="list-disc pl-6 space-y-2 text-sm bd-ink2">
            <li>Illegal items or services under Australian law</li>
            <li>Drugs, drug paraphernalia, or controlled substances</li>
            <li>Weapons, firearms, ammunition, or weapon components</li>
            <li>Stolen property or items suspected to be stolen</li>
            <li>Counterfeit, replica, or infringing goods</li>
            <li>Hazardous materials, explosives, or unsafe chemicals</li>
            <li>Live animals are not permitted</li>
            <li>Adult sexual services or explicit content</li>
            <li>Listings that promote violence, hate, or exploitation</li>
            <li>Misleading, deceptive, or fraudulent listings</li>
          </ul>

          <p className="mt-6 text-sm bd-ink2">
            Listings that violate these rules may be removed, and accounts may be restricted or suspended.
            If you see a listing that appears unsafe or prohibited, please use the report feature on the listing page.
          </p>

          <p className="mt-4 text-sm bd-ink2">
            Need help? Visit the{" "}
            <a className="bd-link font-semibold" href="/contact">Contact</a> page.
          </p>
        </div>
      </div>
    </main>
  );
}
