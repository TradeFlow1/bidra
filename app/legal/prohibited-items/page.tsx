export const metadata = {
  title: "Prohibited Items | Bidra",
};

export default function ProhibitedItemsPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[var(--bidra-bg)] text-[var(--bidra-fg)] px-4 py-10 mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-6">Prohibited items</h1>

      <p className="mb-6 text-sm text-white/70">
        Bidra is a platform for listing items locally in Australia. Some items
        are not allowed to be listed under any circumstances.
      </p>

      <ul className="mt-4 list-disc pl-6 space-y-3 text-sm text-white/85">
        <li>Illegal items or services under Australian law</li>
        <li>Drugs, drug paraphernalia, or controlled substances</li>
        <li>Weapons, firearms, ammunition, or weapon components</li>
        <li>Stolen property or items suspected to be stolen</li>
        <li>Counterfeit, replica, or infringing goods</li>
        <li>Hazardous materials, explosives, or unsafe chemicals</li>
        <li>Adult sexual services or explicit content</li>
        <li>Listings that promote violence, hate, or exploitation</li>
        <li>Misleading, deceptive, or fraudulent listings</li>
      </ul>

      <p className="mt-6 text-sm text-white/70">
        Listings that violate these rules may be removed, and accounts may be
        restricted or suspended. If you see a listing that appears unsafe or
        prohibited, please use the report feature on the listing page.
      </p>
    </main>
  );
}
