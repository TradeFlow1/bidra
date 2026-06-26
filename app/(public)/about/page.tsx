import Link from "next/link";

const values = [
  {
    title: "Clear local buying",
    body: "Bidra keeps listings, offers, messages and handover steps simple so buyers and sellers know what happens next.",
  },
  {
    title: "Buy now means committed",
    body: "The marketplace is designed to reduce flaky behaviour. A confirmed Buy now should be treated as bought, not as a casual hold.",
  },
  {
    title: "Offers without confusion",
    body: "Buyers can negotiate before committing, and sellers can decide whether an offer is worth accepting.",
  },
  {
    title: "Trust and accountability",
    body: "Profiles, messages, reports, support guidance and marketplace rules are built around safer local trading.",
  },
];

const links = [
  { label: "Browse listings", href: "/listings" },
  { label: "Sell an item", href: "/sell/new" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Safety support", href: "/support" },
];

export default function AboutPage() {
  return (
    <main className="bg-white text-[#07152E]">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-10 sm:px-8">
        <section className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-6 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#4F46E5]">About Bidra</div>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.06em] text-[#07152E] sm:text-6xl">A cleaner local marketplace</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-[#475569]">Bidra helps people buy, sell and make offers locally with clearer commitments, better records and fewer vague handover arrangements.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-2xl border border-[#D8E1F0] bg-white px-4 py-2 text-sm font-black text-[#4F46E5] shadow-sm transition hover:bg-[#F8FAFC]">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {values.map((item) => (
            <article key={item.title} className="rounded-[26px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black tracking-[-0.035em] text-[#07152E]">{item.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#475569]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[28px] border border-[#D8E1F0] bg-[#F8FAFC] p-6">
          <h2 className="text-2xl font-black tracking-[-0.04em] text-[#07152E]">Built for practical local trading</h2>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-[#475569]">Bidra focuses on the core marketplace experience first: useful listings, straightforward offers, committed Buy now purchases, messaging, reporting and handover guidance.</p>
        </section>
      </div>
    </main>
  );
}
