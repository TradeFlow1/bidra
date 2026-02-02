export default function ProhibitedItemsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Prohibited items</h1>
      <p className="mt-3 text-base text-black/70">
        To keep Bidra safe and compliant, some items can’t be listed. Listings that breach these rules may be removed and
        repeated attempts may result in account restrictions.
      </p>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Always prohibited</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li><strong>Vapes / nicotine products</strong> (including e-cigarettes, vape devices, pods, nicotine pouches, and related consumables).</li>
          <li><strong>Alcohol</strong> (any alcoholic beverages).</li>
          <li><strong>Sexual / fetish content</strong> (adult sexual products intended for stimulation, explicit sexual services, or pornographic material).</li>
          <li><strong>Illegal drugs</strong> and drug paraphernalia intended for illicit use.</li>
          <li><strong>Stolen goods</strong> or items suspected to be stolen.</li>
          <li><strong>Weapons and weapon parts</strong> where unlawful or restricted (including items marketed primarily as weapons).</li>
          <li><strong>Hate or extremist content</strong>, harassment, threats, or content that targets protected groups.</li>
          <li><strong>Counterfeit goods</strong> or items infringing intellectual property rights.</li>
          <li><strong>Hazardous chemicals</strong> and poisons where restricted or unsafe for consumer sale.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Safety and compliance notes</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Some categories may have additional restrictions depending on Australian law and local regulations.</li>
          <li>If you’re unsure, don’t list it — contact Support first.</li>
          <li>Bidra may use automated checks and manual review to enforce these rules.</li>
        </ul>
      </section>

      <section className="mt-10 text-sm text-black/60">
        <p>
          Read more: <a className="underline" href="/support">Support & Safety</a> and{" "}
          <a className="underline" href="/legal/terms">Terms</a>.
        </p>
      </section>
    </main>
  );
}
