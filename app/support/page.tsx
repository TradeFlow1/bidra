"use client";

import Link from "next/link";
import { ReferencePage, appNarrowShell } from "@/components/marketplace-redesign";

const topics = [
  { title: "Getting started", desc: "Learn how Bidra works", href: "/how-it-works" },
  { title: "Buying safely", desc: "Tips for a safer experience", href: "/help" },
  { title: "Selling on Bidra", desc: "How to list and sell", href: "/sell" },
  { title: "Account & settings", desc: "Manage your account", href: "/dashboard" },
];

const articles = [
  { title: "How do I buy an item?", href: "/how-it-works" },
  { title: "How do I make an offer?", href: "/how-it-works" },
  { title: "How do I sell on Bidra?", href: "/sell" },
  { title: "How do I contact a seller?", href: "/messages" },
];

export default function SupportPage() {
  return (
    <ReferencePage>
      <div className={appNarrowShell + " py-5 sm:py-8"}>
        <section className="bd-page-hero p-5 sm:p-7">
          <div className="max-w-3xl">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#607089]">Help Centre</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#07152E] sm:text-4xl">How can we help you?</h1>
            <p className="mt-2 text-sm leading-6 text-[#526173] sm:text-base">
              Find help for listings, offers, orders, messages, accounts, reports, and marketplace rules.
            </p>
          </div>
          <label className="mt-5 block max-w-3xl">
            <span className="sr-only">Search help articles</span>
            <input className="bd-input rounded-2xl bg-white" placeholder="Search help articles..." />
          </label>
        </section>

        <section className="mt-6 bd-card p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#07152E]">Popular topics</h2>
              <p className="mt-1 text-sm text-[#607089]">Quick links to common marketplace help.</p>
            </div>
            <Link href="/contact" className="bd-btn bd-btn-primary rounded-2xl">Contact support</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map((topic) => (
              <Link key={topic.title} href={topic.href} className="rounded-[20px] border border-[#D7E2F1] bg-[#F8FAFF] p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                <div className="text-sm font-extrabold text-[#0F172A]">{topic.title}</div>
                <div className="mt-1 text-sm text-[#607089]">{topic.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="bd-card p-4 sm:p-6">
            <h2 className="text-xl font-black tracking-tight text-[#07152E]">Browse all articles</h2>
            <div className="mt-4 divide-y divide-[#E6EDF7]">
              {articles.map((article) => (
                <Link key={article.title} href={article.href} className="flex items-center justify-between gap-3 py-3 text-sm font-extrabold text-[#0E7490]">
                  <span>{article.title}</span>
                  <span aria-hidden="true">›</span>
                </Link>
              ))}
            </div>
          </div>
          <aside className="bd-card-soft p-4">
            <h2 className="text-base font-black text-[#07152E]">Need more help?</h2>
            <p className="mt-2 text-sm leading-6 text-[#526173]">Send a support message or report unsafe behaviour from the relevant listing, order, or message.</p>
            <div className="mt-4 grid gap-2">
              <Link href="/contact" className="bd-btn bd-btn-primary rounded-2xl">Contact support</Link>
              <Link href="/feedback" className="bd-btn bd-btn-secondary rounded-2xl">Send feedback</Link>
              <Link href="/legal/prohibited-items" className="bd-btn bd-btn-secondary rounded-2xl">Prohibited items</Link>
            </div>
          </aside>
        </section>
      </div>
    </ReferencePage>
  );
}
