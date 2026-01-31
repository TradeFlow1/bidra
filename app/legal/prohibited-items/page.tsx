export const metadata = {
  title: "Prohibited Items — Bidra",
};

export default function ProhibitedItemsPage() {
  return (
    <main className="bd-container py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Prohibited items</h1>
          <p className="text-sm bd-ink2">
            Bidra is an Australian marketplace. Some items and content are not allowed on Bidra — under any circumstances.
            Prohibited items are blocked at listing creation (server-side). There is no “review to publish” path.
          </p>
        </header>

        <div className="bd-card p-6 space-y-4">
          <h2 className="text-lg font-extrabold bd-ink">Not allowed (examples)</h2>
          <ul className="list-disc pl-6 space-y-2 text-sm bd-ink2">
            <li>Illegal items or services under Australian law</li>
            <li>Drugs, drug paraphernalia, or controlled substances</li>
            <li>Weapons, firearms, ammunition, weapon parts, or instructions enabling harm</li>
            <li>Stolen property or items suspected to be stolen</li>
            <li>Counterfeit, replica, or infringing goods</li>
            <li>Hazardous materials, explosives, unsafe chemicals</li>
            <li><strong>Vapes / nicotine products</strong> and related accessories</li>
            <li><strong>Alcohol</strong> and alcohol supply</li>
            <li><strong>Adult sexual content, fetish content, or sexual services</strong></li>
            <li>Listings that promote violence, hate, exploitation, or harassment</li>
            <li>Misleading, deceptive, or fraudulent listings</li>
            <li>Live animals</li>
          </ul>

          <div className="rounded-xl border bd-bd bg-white/60 p-4">
            <div className="text-sm font-extrabold bd-ink">What happens if someone tries?</div>
            <p className="mt-2 text-sm bd-ink2">
              The listing is rejected. Repeated attempts may lead to account restrictions. If you see something unsafe, use the report feature.
            </p>
          </div>

          <p className="text-sm bd-ink2">
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
