export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { MarketplaceIcon } from "@/components/marketplace-ui";
import { AppPanel, ReferencePage, appNarrowShell } from "@/components/marketplace-redesign";

const topics = [
  { title: "Buying safely", desc: "Buy now, offers, messages and handover basics.", href: "/how-it-works", icon: "browse" as const },
  { title: "Selling items", desc: "Photos, details, pricing and pickup/postage notes.", href: "/sell", icon: "sell" as const },
  { title: "Messages", desc: "Keep payment, pickup and handover details in one thread.", href: "/messages", icon: "messages" as const },
  { title: "Rules", desc: "Terms, privacy, fees and prohibited items.", href: "/legal", icon: "legal" as const },
];

function ArticleLink({ href, title, body }: { href: string; title: string; body: string }) {
  return <Link href={href} className="block rounded-[22px] border border-[#D8E6F8] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#AFC8F8]"><span className="block text-base font-black text-[#07152E]">{title}</span><span className="mt-1 block text-sm font-semibold leading-6 text-[#526173]">{body}</span></Link>;
}

export default function HelpPage() {
  return (
    <ReferencePage>
      <div className={appNarrowShell + " py-5 sm:py-8"}>
        <BackButton href="/" label="Back to home" />
        <section className="mt-4 rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0B4DFF]">Help Centre</div>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">How can we help?</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#36506F] sm:text-base">Search common questions about buying, selling, offers, messages, account access and marketplace rules.</p>
            <form action="/help" className="mx-auto mt-6 flex max-w-2xl gap-2 rounded-full border border-[#CFE0F4] bg-white p-2 shadow-sm">
              <input aria-label="Search help articles" placeholder="Search help articles" className="min-h-11 min-w-0 flex-1 rounded-full px-4 text-sm font-semibold outline-none" />
              <button className="bd-btn bd-btn-primary rounded-full px-5" type="submit">Search</button>
            </form>
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {topics.map((topic) => <Link key={topic.title} href={topic.href} className="rounded-[26px] border border-[#D8E6F8] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#AFC8F8]"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EEF6FF] text-[#0B4DFF]"><MarketplaceIcon name={topic.icon} /></span><span className="mt-4 block text-lg font-black text-[#07152E]">{topic.title}</span><span className="mt-1 block text-sm font-semibold leading-6 text-[#526173]">{topic.desc}</span></Link>)}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <AppPanel>
            <h2 className="text-2xl font-black tracking-tight text-[#07152E]">Popular articles</h2>
            <div className="mt-4 grid gap-3">
              <ArticleLink href="/how-it-works" title="How Buy Now and offers work" body="Understand sale formats and what happens after a buyer acts." />
              <ArticleLink href="/legal/prohibited-items" title="What cannot be listed" body="Review prohibited items before creating a listing." />
              <ArticleLink href="/support" title="Report a listing or account issue" body="Get support for marketplace issues and safety concerns." />
            </div>
          </AppPanel>
          <AppPanel className="bg-[#07152E] text-white">
            <h2 className="text-2xl font-black tracking-tight">Need direct support?</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#C9D8EF]">For account, order, listing, report or technical issues, contact support with relevant listing, order or message details.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row"><Link href="/support" className="bd-btn rounded-2xl bg-white text-[#07152E]">Open support</Link><Link href="/contact" className="bd-btn rounded-2xl border border-white/20 bg-white/10 text-white">Contact us</Link></div>
          </AppPanel>
        </section>
      </div>
    </ReferencePage>
  );
}
