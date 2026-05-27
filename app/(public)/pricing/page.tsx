import Link from "next/link";

const pricing = [
  {
    title: "Free standard listings",
    body: "Standard item listings are free during Bidra V1, so sellers can list local items without an upfront listing fee.",
  },
  {
    title: "No buyer platform fee in V1",
    body: "Buyers can browse, save, message, buy now and make offers without a Bidra buyer platform fee during V1.",
  },
  {
    title: "Payment arranged directly",
    body: "Bidra helps users connect and keep records. Buyers and sellers arrange payment, pickup, postage and handover directly.",
  },
  {
    title: "Optional paid features later",
    body: "If optional upgrades are added later, pricing should be shown clearly before purchase.",
  },
];

const links = [
  { label: "Browse listings", href: "/listings" },
  { label: "Sell an item", href: "/sell/new" },
  { label: "Fees policy", href: "/legal/fees" },
  { label: "Terms", href: "/legal/terms" },
];

export default function PricingPage() {
  return (
    <main className="bg-white text-[#07152E]">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-10 sm:px-8">
        <section className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-6 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#4F46E5]">Pricing</div>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.06em] text-[#07152E] sm:text-6xl">Simple V1 pricing</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-[#475569]">Bidra V1 keeps marketplace pricing simple while the core buying, selling, offers and handover experience is being built.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-2xl border border-[#D8E1F0] bg-white px-4 py-2 text-sm font-black text-[#4F46E5] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F8FAFC] hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {pricing.map((item) => (
            <article key={item.title} className="rounded-[26px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black tracking-[-0.035em] text-[#07152E]">{item.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#475569]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[28px] border border-[#D8E1F0] bg-[#F8FAFC] p-6">
          <h2 className="text-2xl font-black tracking-[-0.04em] text-[#07152E]">No hidden Bidra charges</h2>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-[#475569]">Marketplace fees and pricing rules should stay visible in the fees policy. Users should not have to discover charges after committing to a trade.</p>
        </section>
      </div>
    </main>
  );
}
