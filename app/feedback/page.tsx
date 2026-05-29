import Link from "next/link";

const feedbackOptions = [
  {
    title: "Report a marketplace problem",
    body: "For unsafe behaviour, suspicious listings, prohibited items, scams, no-shows or handover problems, start with support guidance and use report actions inside the relevant listing, order or message where available.",
    href: "/support",
  },
  {
    title: "Send product feedback",
    body: "Tell us what is confusing, broken or missing. Use the contact form so the feedback is saved for review.",
    href: "/contact",
  },
  {
    title: "Get help using Bidra",
    body: "Read practical help for buying, Buy Now commitments, offers, messages, selling and account setup.",
    href: "/help",
  },
  {
    title: "Dispute guidance",
    body: "Learn what to record and what to do when a trade does not go to plan.",
    href: "/disputes",
  },
];

export default function FeedbackPage() {
  return (
    <main className="bg-white text-[#07152E]">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-10 sm:px-8">
        <section className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-6 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#4F46E5]">Feedback</div>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.06em] text-[#07152E] sm:text-6xl">Help improve Bidra</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-[#475569]">Choose the right path for product feedback, marketplace safety concerns, disputes or general help.</p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {feedbackOptions.map((option) => (
            <Link key={option.href + option.title} href={option.href} className="rounded-[26px] border border-[#D8E1F0] bg-white p-5 shadow-sm transition">
              <h2 className="text-xl font-black tracking-[-0.035em] text-[#07152E]">{option.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#475569]">{option.body}</p>
              <span className="mt-5 inline-flex text-sm font-black text-[#4F46E5]">Open →</span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
