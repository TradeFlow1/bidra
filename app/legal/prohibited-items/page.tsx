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
                To keep Bidra safe and compliant, some goods, animals, services, and categories cannot be listed. Listings that breach these rules may be removed, reports may be investigated, and repeated or serious attempts may result in account restrictions.
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
            <div className="mt-1 text-sm text-neutral-600">These categories are not allowed on Bidra and may be removed without warning, even if a listing was already published.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Enforcement</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Automated and manual review</div>
            <div className="mt-1 text-sm text-neutral-600">Bidra may use automated checks and manual review to enforce marketplace rules.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Unsure?</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Do not list first</div>
            <div className="mt-1 text-sm text-neutral-600">If you are unsure whether something is allowed, contact support before listing it.</div>
          </div>
        </div>

        <SectionCard title="Always prohibited">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li><strong>Live animals</strong>, livestock, pets, wildlife, birds, fish, reptiles, insects, animal breeding listings, or listings for adoption, rehoming, or transfer of live animals.</li>
            <li><strong>Vapes and nicotine products</strong>, including e-cigarettes, vape devices, pods, nicotine pouches, and related consumables.</li>
            <li><strong>Alcohol</strong>, including any alcoholic beverages.</li>
            <li><strong>Illegal drugs</strong> and drug paraphernalia intended for illicit use.</li>
            <li><strong>Sexual or fetish content</strong>, including adult sexual products intended for stimulation, explicit sexual services, or pornographic material.</li>
            <li><strong>Weapons and weapon parts</strong> where unlawful or restricted, including items marketed primarily as weapons.</li>
            <li><strong>Stolen goods</strong> or items suspected to be stolen.</li>
            <li><strong>Counterfeit goods</strong>, replicas passed off as genuine, or items infringing intellectual property rights.</li>
            <li><strong>Hate, extremist, violent, or abusive content</strong>, including threats, harassment, or content targeting protected groups.</li>
            <li><strong>Hazardous chemicals, poisons, explosives, or unsafe materials</strong> where restricted or unsafe for consumer sale.</li>
            <li><strong>Illegal, unlawfully supplied, or regulation-evading goods</strong>.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Restricted, regulated, or unsafe categories that may also be blocked">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Some categories may have additional restrictions depending on Australian law and local regulations.</li>
            <li>Bidra may prohibit certain items even if they may be legal in limited contexts, where they create elevated safety, fraud, compliance, or moderation risk.</li>
            <li>If an item requires specialist licensing, age-gating, transport controls, safety checks, or compliance proof, do not assume it is allowed on Bidra.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Fraud, deception, and unlawful activity">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Listings intended to scam, impersonate, mislead, or deceive other users are prohibited.</li>
            <li>Listings for fake documents, forged credentials, manipulated serials, or tools designed primarily to enable fraud are prohibited.</li>
            <li>Items that encourage unlawful conduct, bypass legal restrictions, or facilitate criminal activity are prohibited.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Services and non-item listings that are not allowed">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>Listings for explicit sexual services or exploitative services are prohibited.</li>
            <li>Listings that are primarily for unsafe, unlawful, or misleading services rather than legitimate goods are prohibited.</li>
            <li>Bidra may remove listings that do not fit the intended marketplace model for physical goods and compliant local trading.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Safety and compliance notes">
          <ul className="list-disc pl-5 text-black/75 space-y-2">
            <li>If you are unsure, do not list it. Contact Support first.</li>
            <li>Bidra may use automated checks and manual review to enforce these rules.</li>
            <li>We may remove listings, restrict accounts, preserve audit records, or take additional platform action where repeated or serious breaches occur.</li>
            <li>These examples are not exhaustive. Bidra may remove listings that present comparable safety, fraud, abuse, or compliance risks.</li>
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
