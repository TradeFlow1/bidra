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
    <main className="bg-[#FCFBFE] text-[#17131F]">
      <div className="md:hidden">
        <section className="px-4 pb-24 pt-4">
          <div className="rounded-[24px] border border-[#E8E2EF] bg-[#F7F5FA] p-5 shadow-[0_10px_28px_rgba(15,12,22,0.04)]">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6F3FF5]">Support</div>
            <h1 className="mt-3 text-3xl font-black leading-[0.95] tracking-[-0.05em] text-[#17131F]">Safety help</h1>
            <p className="mt-3 text-sm font-medium leading-6 text-[#4F475D]">Report problems, check dispute steps, or get help with unsafe behaviour.</p>
            <Link href="/feedback" className="mt-5 flex h-12 items-center justify-center rounded-[18px] bg-[#6F3FF5] px-4 text-sm font-semibold !text-white">Report a problem</Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="flex min-h-[72px] items-center rounded-[18px] border border-[#E8E2EF] bg-white px-4 text-sm font-semibold leading-tight text-[#6F3FF5] shadow-sm">
                {action.label}
              </Link>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {mobileTasks.map((task) => (
              <Link key={task.title} href={task.href} className="block rounded-[20px] border border-[#E8E2EF] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black tracking-[-0.03em] text-[#17131F]">{task.title}</h2>
                  <span className="text-sm font-semibold text-[#6F3FF5]">Open</span>
                </div>
                <p className="mt-2 text-sm font-medium leading-6 text-[#4F475D]">{task.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mx-auto hidden w-full max-w-[1120px] px-6 py-10 sm:px-8 md:block">
        <section className="rounded-[28px] border border-[#E8E2EF] bg-[#F7F5FA] p-6 shadow-[0_10px_28px_rgba(15,12,22,0.04)] sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-[#6F3FF5]">Support</div>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.06em] text-[#17131F] sm:text-6xl">Safety and reporting</h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-[#4F475D]">Guidance for handover, committed purchases, reports, disputes and unsafe behaviour.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="rounded-[18px] border border-[#E8E2EF] bg-white px-4 py-2 text-sm font-semibold text-[#6F3FF5] shadow-sm transition hover:bg-[#F7F5FA]">
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {supportSections.map((section) => (
            <article key={section.title} className="rounded-[22px] border border-[#E8E2EF] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black tracking-[-0.03em] text-[#17131F]">{section.title}</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-[#4F475D]">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[24px] border border-[#E8E2EF] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black tracking-[-0.03em] text-[#17131F]">Need general help?</h2>
          <p className="mt-2 text-sm font-medium leading-7 text-[#4F475D]">Use the Help Centre for buying, selling, offers, messages and account setup.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/help" className="bd-btn bd-btn-primary rounded-[18px] px-6">Open help centre</Link>
            <Link href="/listings" className="bd-btn bd-btn-secondary rounded-[18px] bg-white px-6">Browse listings</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
