import Link from "next/link";

const steps = [
  {
    title: "1. Browse local listings",
    body: "Use category, price and location filters to find items near you. Check the photos, condition, location and seller profile before deciding.",
  },
  {
    title: "2. Choose Buy Now or Make an Offer",
    body: "Buy Now is for committing to the listed price. Make an Offer is for negotiating before a seller accepts. Do not commit unless you intend to follow through.",
  },
  {
    title: "3. Keep messages on Bidra",
    body: "Ask about pickup, postage, payment expectations and timing inside Bidra messages so both sides have a clear record.",
  },
  {
    title: "4. Arrange payment and handover",
    body: "Buyers and sellers arrange payment, pickup, postage and handover directly. Agree on the details early and keep the plan realistic.",
  },
];

const rules = [
  "Buy Now means bought. The item should be treated as committed once confirmed.",
  "No-shows and flaky behaviour can be reported and reviewed.",
  "Sellers should describe items honestly and set pickup or postage expectations early.",
  "Buyers should ask questions before committing, not after.",
];

const quickLinks = [
  { label: "Browse listings", href: "/listings" },
  { label: "Sell an item", href: "/sell/new" },
  { label: "Safety support", href: "/support" },
  { label: "Marketplace rules", href: "/legal/prohibited-items" },
];

export default function HowItWorksPage() {
  return (
    <main className="bg-white text-[#07152E]">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-10 sm:px-8">
        <section className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-6 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#4F46E5]">How it works</div>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.06em] text-[#07152E] sm:text-6xl">Buy, sell and hand over clearly</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-[#475569]">Bidra is built around clear commitments: browse locally, buy or offer, keep messages on platform, then arrange payment and handover directly.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-2xl border border-[#D8E1F0] bg-white px-4 py-2 text-sm font-black text-[#4F46E5] shadow-sm transition hover:bg-[#F8FAFC]">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {steps.map((step) => (
            <article key={step.title} className="rounded-[26px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black tracking-[-0.035em] text-[#07152E]">{step.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#475569]">{step.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
          <article className="rounded-[28px] border border-[#D8E1F0] bg-[#F8FAFC] p-6">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-[#07152E]">The important part</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-[#475569]">Bidra is not designed for casual holds where buyers can click now and decide later. A confirmed Buy Now should remove uncertainty for the seller and create a clear next step for both sides.</p>
          </article>

          <aside className="rounded-[28px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black tracking-[-0.03em] text-[#07152E]">Marketplace expectations</h2>
            <ul className="mt-4 space-y-3">
              {rules.map((rule) => (
                <li key={rule} className="rounded-2xl bg-[#F8FAFC] px-4 py-3 text-sm font-bold leading-6 text-[#475569]">{rule}</li>
              ))}
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
