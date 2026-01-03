export const metadata = {
  title: "Bidra | Prohibited Items",
};

export default function ProhibitedItemsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-[#0B0E11]">Prohibited Items</h1>
      <p className="mt-3 text-black/70">
        Bidra is a platform for Australians to list items and make offers. To keep the marketplace safe and lawful,
        some items are not allowed. If a listing looks prohibited, please report it from the listing page.
      </p>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-[#0B0E11]">Always prohibited</h2>
          <ul className="mt-2 list-disc pl-5 text-black/75 space-y-1">
            <li>Illegal, stolen, or counterfeit goods.</li>
            <li>Weapons, weapon parts, ammunition, and items marketed for violence.</li>
            <li>Explosives, fireworks, dangerous chemicals, poisons, or controlled substances.</li>
            <li>Adult sexual services and explicit content.</li>
            <li>Hate material, harassment, or extremist content.</li>
            <li><strong>All live animals</strong> (strictly prohibited).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#0B0E11]">Restricted / regulated items</h2>
          <p className="mt-2 text-black/70">
            Some items may be legal but are heavily regulated. If in doubt, do not list it. Listings may be removed if
            they create safety risk or legal exposure.
          </p>
          <ul className="mt-2 list-disc pl-5 text-black/75 space-y-1">
            <li>Items requiring permits or licensed sale.</li>
            <li>Age-restricted products (e.g., nicotine, alcohol) — not supported on Bidra at this time.</li>
            <li>Items that imply unsafe activity or bypassing the law.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-black/10 bg-slate-50 p-4">
          <h2 className="text-lg font-semibold text-[#0B0E11]">Reporting prohibited items</h2>
          <p className="mt-1 text-black/70">
            Open the listing and select <strong>Report</strong>. Choose the most relevant reason (e.g., prohibited item, safety risk).
            Our team reviews reports and may remove listings or restrict accounts for repeated breaches.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#0B0E11]">Important note</h2>
          <p className="mt-2 text-black/70">
            Bidra is not the seller of items listed on the platform. Sellers are responsible for ensuring their listings comply with Australian laws.
            We may remove listings to protect the community and the platform.
          </p>
        </section>
      </div>
    </div>
  );
}
