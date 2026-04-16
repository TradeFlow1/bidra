import Link from "next/link";

function SectionCard(props: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-extrabold tracking-tight bd-ink">{props.title}</h2>
      <div className="mt-3">{props.children}</div>
    </section>
  );
}

export default function ProhibitedItemsPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Prohibited items</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Items that cannot be listed</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                To keep Bidra safe and compliant, some items cannot be listed. Listings that breach these rules may be removed, and repeated attempts may result in account restrictions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/legal" className="bd-btn bd-btn-primary text-center">
                Legal hub
              </Link>
              <Link href="/support" className="bd-btn bd-btn-ghost text-center">
                Support and safety
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Rule level</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Always prohibited</div>
            <div className="mt-1 text-sm text-neutral-600">These categories are not allowed on Bidra and may be removed without warning.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Enforcement</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Automated and manual review</div>
            <div className="mt-1 text-sm text-neutral-600">Bidra may use automated checks and manual review to enforce marketplace rules.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Unsure?</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Do not list first</div>
            <div className="mt-1 text-sm text-neutral-600">If you are unsure whether an item is allowed, contact support before listing it.</div>
          </div>
        </div>

        <SectionCard title="Always prohibited">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li><strong>Vapes and nicotine products</strong>, including e-cigarettes, vape devices, pods, nicotine pouches, and related consumables.</li>
            <li><strong>Alcohol</strong>, including any alcoholic beverages.</li>
            <li><strong>Sexual or fetish content</strong>, including adult sexual products intended for stimulation, explicit sexual services, or pornographic material.</li>
            <li><strong>Illegal drugs</strong> and drug paraphernalia intended for illicit use.</li>
            <li><strong>Stolen goods</strong> or items suspected to be stolen.</li>
            <li><strong>Weapons and weapon parts</strong> where unlawful or restricted, including items marketed primarily as weapons.</li>
            <li><strong>Hate or extremist content</strong>, harassment, threats, or content targeting protected groups.</li>
            <li><strong>Counterfeit goods</strong> or items infringing intellectual property rights.</li>
            <li><strong>Hazardous chemicals</strong> and poisons where restricted or unsafe for consumer sale.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Safety and compliance notes">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Some categories may have additional restrictions depending on Australian law and local regulations.</li>
            <li>If you are unsure, do not list it. Contact Support first.</li>
            <li>Bidra may use automated checks and manual review to enforce these rules.</li>
          </ul>
        </SectionCard>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">Need guidance?</div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link className="bd-btn bd-btn-ghost text-center" href="/support">Support and safety</Link>
            <Link className="bd-btn bd-btn-ghost text-center" href="/legal/terms">Terms</Link>
            <Link className="bd-btn bd-btn-ghost text-center" href="/contact">Contact</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
