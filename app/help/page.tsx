import Link from "next/link";

const helpSections = [
  {
    title: "Buying an item",
    body: "Open a listing, check the photos, description, condition, location and seller details. If the item suits you, use Buy now for a committed purchase or Make an offer when offers are available.",
  },
  {
    title: "Buy now means bought",
    body: "When you click Buy now and confirm, the item is treated as bought and removed from active sale. Do not use Buy now unless you intend to follow through with payment and handover.",
  },
  {
    title: "Making an offer",
    body: "Use Make an offer when you want to suggest a price. The seller can accept, decline or ignore the offer. An accepted offer should be treated seriously and followed through promptly.",
  },
  {
    title: "Contacting a seller",
    body: "Use Messages to ask about condition, pickup, postage, payment expectations and handover timing. Keep important details in Bidra messages so both sides have a record.",
  },
  {
    title: "Selling an item",
    body: "Create a listing with clear photos, an honest description, condition, location and price. Set pickup or postage expectations early so buyers know what is involved before committing.",
  },
  {
    title: "Account and password help",
    body: "Use the sign in page for login, account creation and password reset. New accounts must verify email before login. Account pages let signed-in users manage listings, messages and saved items.",
  },
];

const quickActions = [
  { label: "Browse listings", href: "/listings" },
  { label: "Sell an item", href: "/sell/new" },
  { label: "Messages", href: "/messages" },
  { label: "Reset password", href: "/forgot-password" },
];

const mobileTasks = [
  { title: "Buy", body: "Check item details, then use Buy now only when you are ready to follow through.", href: "/listings" },
  { title: "Offer", body: "Send a fair price and keep the deal inside Bidra messages.", href: "/listings" },
  { title: "Sell", body: "Add clear photos, price, condition and pickup details before publishing.", href: "/sell/new" },
  { title: "Account", body: "Reset password, verify email, then manage messages and saved items.", href: "/forgot-password" },
];

export default function HelpPage() {
  return (
    <main className="bg-white text-[#07152E]">
      <div className="md:hidden">
        <section className="px-4 pb-24 pt-4">
          <div className="rounded-[28px] border border-[#D8E6F8] bg-[#EEF6FF] p-5">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4F46E5]">Help centre</div>
            <h1 className="mt-3 text-3xl font-black leading-[0.95] tracking-[-0.05em] text-[#07152E]">Get help fast</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#475569]">Pick what you need and get back to buying, selling or messaging.</p>
            <Link href="/support" className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-4 text-sm font-black text-white !text-white">Safety or report issue</Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="flex min-h-[72px] items-center rounded-[22px] border border-[#D8E1F0] bg-white px-4 text-sm font-black leading-tight text-[#4F46E5] shadow-sm">
                {action.label}
              </Link>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {mobileTasks.map((task) => (
              <Link key={task.title} href={task.href} className="block rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black tracking-[-0.035em] text-[#07152E]">{task.title}</h2>
                  <span className="text-sm font-black text-[#4F46E5]">Open</span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#475569]">{task.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mx-auto hidden w-full max-w-[1120px] px-6 py-10 sm:px-8 md:block">
        <section className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-6 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#4F46E5]">Help centre</div>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.06em] text-[#07152E] sm:text-6xl">How Bidra works</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-[#475569]">Practical answers for buying, selling, offers, messages and account setup. Start here before jumping between support pages.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="rounded-2xl border border-[#D8E1F0] bg-white px-4 py-2 text-sm font-black text-[#4F46E5] shadow-sm transition hover:bg-[#F8FAFC]">
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {helpSections.map((section) => (
            <article key={section.title} className="rounded-[26px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black tracking-[-0.035em] text-[#07152E]">{section.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#475569]">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[28px] border border-[#D8E1F0] bg-[#F8FAFC] p-6">
          <h2 className="text-2xl font-black tracking-[-0.04em]">Still need help?</h2>
          <p className="mt-2 text-sm font-semibold leading-7 text-[#475569]">Use Support for safety, reports, no-shows and dispute guidance.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/support" className="bd-btn bd-btn-primary rounded-2xl px-6">Open support</Link>
            <Link href="/contact" className="bd-btn bd-btn-secondary rounded-2xl bg-white px-6">Contact options</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
