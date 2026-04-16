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

function PrincipleCard(props: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="text-sm font-extrabold bd-ink">{props.title}</div>
      <div className="mt-1 text-sm bd-ink2 leading-7">{props.desc}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">About Bidra</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">
                A simpler, safer local marketplace
              </h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Bidra is an Australian-focused marketplace built from scratch with original design and copy. List items for Buy Now or receive offers, message clearly, and complete local pickups with confidence.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/listings" className="bd-btn bd-btn-primary text-center">
                Browse listings
              </Link>
              <Link href="/how-it-works" className="bd-btn bd-btn-ghost text-center">
                How it works
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Marketplace model</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Local and direct</div>
            <div className="mt-1 text-sm text-neutral-600">People list items and connect directly for local handover.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Trust</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Clearer trade flow</div>
            <div className="mt-1 text-sm text-neutral-600">Profiles, orders, messages, and support all work together to reduce confusion.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Safety</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Policies with teeth</div>
            <div className="mt-1 text-sm text-neutral-600">Reporting, restrictions, and platform rules help reduce risky behaviour.</div>
          </div>
        </div>

        <SectionCard title="What Bidra is built for">
          <p className="text-sm bd-ink2 leading-7">
            Bidra is designed for people who want a cleaner local marketplace experience: clearer listings, better structure around offers and orders, and stronger trust signals around who they are dealing with.
          </p>
          <p className="mt-3 text-sm bd-ink2 leading-7">
            The goal is not just to list items. The goal is to make local buying and selling feel more serious, more understandable, and more dependable.
          </p>
        </SectionCard>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight bd-ink">Marketplace principles</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <PrincipleCard
              title="Clarity"
              desc="Listings should be honest, detailed, and easy to understand before people commit."
            />
            <PrincipleCard
              title="Fairness"
              desc="Offers reduce messy back-and-forth and help make real buyer intent clearer."
            />
            <PrincipleCard
              title="Safety"
              desc="Policies, reporting, and platform controls help reduce risky transactions and abuse."
            />
          </div>
        </section>

        <SectionCard title="How Bidra is different">
          <ul className="list-disc pl-5 text-sm bd-ink2 leading-7 space-y-2">
            <li>Buy Now and Timed Offers are clearly separated so expectations are easier to understand.</li>
            <li>Bidra is platform-first: listings, messages, orders, and support are connected into one flow.</li>
            <li>Trust matters: clearer account, order, and support surfaces help users make better decisions.</li>
            <li>Local trading stays practical: pickup context, messaging, and safety guidance are part of the product.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Read before you trade">
          <div className="flex flex-wrap gap-2">
            <Link href="/how-it-works" className="bd-btn bd-btn-ghost text-center">
              How it works
            </Link>
            <Link href="/support" className="bd-btn bd-btn-ghost text-center">
              Support and safety
            </Link>
            <Link href="/legal" className="bd-btn bd-btn-ghost text-center">
              Legal hub
            </Link>
            <Link href="/legal/prohibited-items" className="bd-btn bd-btn-ghost text-center">
              Prohibited items
            </Link>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
