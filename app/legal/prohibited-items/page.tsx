export const metadata = { title: "Prohibited Items — Bidra" };

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}

export default function ProhibitedItemsPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Prohibited items</h1>
          <p className="bd-ink2 leading-7">
            Bidra is a general marketplace, but some items are not allowed for safety, legal, or policy reasons.
            Prohibited items cannot be listed on Bidra.
          </p>
          <p className="text-sm bd-ink2">
            We block prohibited items at listing creation. Attempts may be logged and repeated attempts can lead to restrictions.
          </p>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-7">
          <section className="space-y-2">
            <H2>Not allowed (examples)</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>Illegal items, stolen goods, or services that facilitate wrongdoing.</li>
              <li>Drugs, drug paraphernalia intended for illicit use, and controlled substances.</li>
              <li>Vapes, nicotine products, and related consumables (including e-liquids and disposable vapes).</li>
              <li>Alcohol and alcohol-related sales.</li>
              <li>Weapons and weapon components (including firearms, ammunition, and restricted weapons).</li>
              <li>Explosives, fireworks, or hazardous precursors and highly dangerous chemicals.</li>
              <li>Adult sexual services, explicit sexual content, or fetish content intended for sexual stimulation.</li>
              <li>Counterfeit or infringing goods, fake branded items, or items that clearly violate IP rights.</li>
              <li>Items that encourage fraud, scams, or deception (e.g., fake documents, stolen accounts).</li>
              <li>Live animals or sales that involve cruelty or illegal wildlife trade.</li>
              <li>Anything that is unsafe to ship or handle without specialist licensing (where applicable).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>Borderline or regulated items</H2>
            <p className="text-sm bd-ink2 leading-7">
              Some items are legal but heavily regulated (for example, certain tools or collectibles). If an item is commonly associated with harm,
              illegal use, or restricted trade, Bidra may treat it as prohibited or require clearer description and safe handling expectations.
            </p>
            <p className="text-sm bd-ink2 leading-7">
              If you’re unsure, do not list it — contact support first.
            </p>
          </section>

          <section className="space-y-2">
            <H2>What happens if someone tries to list prohibited items</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>Listings may be blocked automatically at creation.</li>
              <li>Existing listings may be removed if later detected or reported.</li>
              <li>Accounts may be restricted or suspended for repeated attempts or serious breaches.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>Report a listing</H2>
            <p className="text-sm bd-ink2 leading-7">
              If you see a listing that looks prohibited or unsafe, please report it from the listing page.
              Reports help keep Bidra safe for everyone.
            </p>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            This page is a summary. Bidra may update prohibited categories over time to meet safety and legal requirements.
          </p>
        </div>
      </div>
    </main>
  );
}
