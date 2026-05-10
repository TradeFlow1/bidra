import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

function SectionCard(props: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
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
    <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5">
      <div className="text-sm font-extrabold bd-ink">{props.title}</div>
      <div className="mt-1 text-sm bd-ink2 leading-7">{props.desc}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="bd-container py-10">
      <div className="mx-auto w-full mb-4 w-full max-w-6xl px-4"><BackButton href="/" label="Back to home" /></div>
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-[30px] border border-[#D8E1F0] bg-gradient-to-br from-white to-[#F8FAFC] p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">About Bidra</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">
                About Bidra
              </h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Bidra helps people list items, receive offers, and arrange pickup or postage through messages.
              </p>
            </div>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Link href="/listings" className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto">
                Browse listings
              </Link>
              <Link href="/how-it-works" className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto">
                How it works
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Marketplace model</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Local and direct</div>
            <div className="mt-1 text-sm text-neutral-600">People list items and connect directly for local handover.</div>
          </div>

          <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Trust</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Clearer trade flow</div>
            <div className="mt-1 text-sm text-neutral-600">Profiles, orders, messages, and support are connected.</div>
          </div>

          <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Safety</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Marketplace rules</div>
            <div className="mt-1 text-sm text-neutral-600">Reporting, restrictions, and platform rules help reduce risky behaviour.</div>
          </div>
        </div>

        <SectionCard title="What Bidra is built for">
          <p className="text-sm bd-ink2 leading-7">
            Bidra provides clear listings, structured offers and orders, and transparent profiles.
          </p>
          <p className="mt-3 text-sm bd-ink2 leading-7">
            The goal is to make local buying and selling clearer and more dependable.
          </p>
        </SectionCard>

        <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
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
              desc="Policies and reporting help reduce risky behaviour."
            />
          </div>
        </section>

        <SectionCard title="How Bidra is different">
          <ul className="list-disc pl-5 text-sm bd-ink2 leading-7 space-y-2">
            <li>Buy Now and Timed Offers are clearly separated so expectations are easier to understand.</li>
            <li>Bidra is platform-first: listings, messages, orders, and support are connected into one flow.</li>
            <li>Clear account, order, and support pages help users make better decisions.</li>
            <li>Local trading stays practical: pickup context, messaging, and safety guidance are part of the product.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Useful links">
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Link href="/how-it-works" className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto">
              How it works
            </Link>
            <Link href="/support" className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto">
              Support
            </Link>
            <Link href="/legal" className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto">
              Legal hub
            </Link>
            <Link href="/legal/prohibited-items" className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto">
              Prohibited items
            </Link>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

