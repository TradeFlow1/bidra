import FeedbackClient from "./feedback-client";
import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

export const metadata = { title: "Feedback - Bidra" };

export default function FeedbackPage() {
  const actionClass = "inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto";

  return (
    <main className="bd-container py-6 sm:py-10">
      <div className="mx-auto mb-4 w-full max-w-7xl px-4">
        <BackButton href="/listings" label="Back to marketplace" />
      </div>

      <div className="container max-w-7xl space-y-5">
        <section className="rounded-[30px] border border-[#D8E1F0] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Feedback</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Share feedback</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Tell us what is confusing, broken, or missing.
              </p>
            </div>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Link href="/contact" className={actionClass}>
                Contact support
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
            <div className="text-sm font-extrabold bd-ink">Submit feedback</div>
            <p className="mt-2 text-sm bd-ink2 leading-7">
              Use this form for product suggestions, confusing pages, or broken flows.
            </p>
            <div className="mt-5">
              <FeedbackClient />
            </div>
          </div>

          <aside className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
            <div className="text-sm font-extrabold bd-ink">Use Contact for urgent issues</div>
            <p className="mt-2 text-sm bd-ink2 leading-7">
              Account, order, listing, safety, and technical issues should go to support.
            </p>
            <div className="mt-4">
              <Link href="/contact" className={actionClass}>
                Contact support
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
