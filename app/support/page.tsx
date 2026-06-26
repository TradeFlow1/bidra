import Link from "next/link";

const supportSections = [
  {
    title: "Safe handover",
    body: "Agree on pickup or postage clearly before meeting. Use public places where possible, avoid risky locations, and do not share unnecessary personal details.",
  },
  {
    title: "No-shows and flaky buyers",
    body: "Buy now is a committed purchase. If a buyer commits and then does not follow through, keep the messages and use the order/report options so the behaviour can be reviewed.",
  },
  {
    title: "Problems with a seller",
    body: "If the item is not as described, the seller stops responding, or handover details change unexpectedly, keep the conversation on Bidra and report the issue from the listing, order or messages.",
  },
  {
    title: "Reporting a listing",
    body: "Report listings that look unsafe, illegal, stolen, misleading, spammy or prohibited. Include the reason and any useful context so the listing can be reviewed quickly.",
  },
  {
    title: "Keep chats on Bidra",
    body: "Messages on Bidra make it easier to review payment expectations, pickup arrangements and behaviour if something goes wrong.",
  },
  {
    title: "Disputes",
    body: "Start by contacting the other user clearly. Keep records of messages, listing details, payment and handover plans. If the issue continues, use report and dispute guidance.",
  },
];

const quickActions = [
  { label: "Report problem", href: "/feedback" },
  { label: "Disputes", href: "/disputes" },
  { label: "Prohibited", href: "/legal/prohibited-items" },
  { label: "Contact", href: "/contact" },
];

const mobileTasks = [
  { title: "Unsafe listing", body: "Report anything illegal, stolen, misleading or risky.", href: "/feedback" },
  { title: "Buyer no-show", body: "Keep the messages and report the order or conversation.", href: "/disputes" },
  { title: "Seller issue", body: "Stay on Bidra messages and keep records before reporting.", href: "/disputes" },
  { title: "Handover", body: "Agree on pickup or postage before meeting. Use public places.", href: "/help" },
];

export default function SupportPage() {
  return (
    <main className="bg-white text-[#07152E]">
      <div className="md:hidden">
        <section className="px-4 pb-24 pt-4">
          <div className="rounded-[28px] border border-[#D8E6F8] bg-[#EEF6FF] p-5">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4F46E5]">Support</div>
            <h1 className="mt-3 text-3xl font-black leading-[0.95] tracking-[-0.05em] text-[#07152E]">Safety help</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#475569]">Report problems, check dispute steps, or get help with unsafe behaviour.</p>
            <Link href="/feedback" className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-4 text-sm font-black text-white !text-white">Report a problem</Link>
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
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#4F46E5]">Support</div>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.06em] text-[#07152E] sm:text-6xl">Safety and reporting</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-[#475569]">Guidance for handover, committed purchases, reports, disputes and unsafe behaviour.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="rounded-2xl border border-[#D8E1F0] bg-white px-4 py-2 text-sm font-black text-[#4F46E5] shadow-sm transition hover:bg-[#F8FAFC]">
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {supportSections.map((section) => (
            <article key={section.title} className="rounded-[26px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black tracking-[-0.035em] text-[#07152E]">{section.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#475569]">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[28px] border border-[#D8E1F0] bg-[#F8FAFC] p-6">
          <h2 className="text-2xl font-black tracking-[-0.04em]">Need general help?</h2>
          <p className="mt-2 text-sm font-semibold leading-7 text-[#475569]">Use the Help Centre for buying, selling, offers, messages and account setup.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/help" className="bd-btn bd-btn-primary rounded-2xl px-6">Open help centre</Link>
            <Link href="/listings" className="bd-btn bd-btn-secondary rounded-2xl bg-white px-6">Browse listings</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
