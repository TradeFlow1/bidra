import SellNewClient from "./sell-new-client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFeedbackGate } from "@/lib/feedback-gate";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/ui/back-button";
import { AppPanel, ProductCollage, ReferencePage, appNarrowShell } from "@/components/marketplace-redesign";

export const dynamic = "force-dynamic";

function buildDefaultLocation(u: { suburb?: string | null; state?: string | null; postcode?: string | null }) {
  const suburb = (u.suburb || "").trim();
  const state = (u.state || "").trim().toUpperCase();
  const postcode = (u.postcode || "").trim();
  const left = [postcode, suburb].filter(Boolean).join(" ").trim();
  return left && state ? left + ", " + state : left || state || "";
}

export default async function SellNewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/sell/new");

  const gate = await getFeedbackGate(session.user.id, 48);
  if (gate.blocked) {
    return (
      <ReferencePage>
        <div className={appNarrowShell + " py-6"}>
          <BackButton href="/dashboard" label="Back to dashboard" />
          <AppPanel className="mt-4">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0E7490]">Before selling</div>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#07152E]">Finish feedback</h1>
            <p className="mt-2 text-sm font-semibold text-[#526173]">You have {gate.pendingCount} pending feedback task(s) older than {gate.graceHours} hours.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row"><a href={gate.feedbackUrl || "/orders"} className="bd-btn bd-btn-primary rounded-2xl">Complete feedback</a><a href="/orders" className="bd-btn bd-btn-secondary rounded-2xl">View orders</a></div>
          </AppPanel>
        </div>
      </ReferencePage>
    );
  }

  const userRow = await prisma.user.findUnique({ where: { id: session.user.id }, select: { suburb: true, state: true, postcode: true } });
  const defaultLocation = userRow ? buildDefaultLocation(userRow) : "";

  return (
    <ReferencePage>
      <div className={appNarrowShell + " py-5 sm:py-7"}>
        <BackButton href="/dashboard" label="Back to dashboard" />
        <section className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <div className="rounded-[32px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-7">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0E7490]">Sell on Bidra</div>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-5xl">Sell your item</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#36506F] sm:text-base">Add photos, details, price and location. Buyers and sellers arrange payment, pickup, postage and handover directly.</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black text-[#0E7490]"><span className="rounded-full bg-white px-3 py-2">Details</span><span className="rounded-full bg-white px-3 py-2">Photos</span><span className="rounded-full bg-white px-3 py-2">Review</span></div>
            </div>
            <div className="mt-4"><SellNewClient defaultLocation={defaultLocation} /></div>
          </div>
          <aside className="grid gap-4 lg:sticky lg:top-24">
            <AppPanel>
              <h2 className="text-xl font-black tracking-tight text-[#07152E]">Selling tips</h2>
              <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-[#526173]"><li>Use clear product-first photos.</li><li>Write condition, faults and included accessories.</li><li>Set pickup/postage expectations early.</li><li>Keep handover details in Messages.</li></ul>
            </AppPanel>
            <div className="hidden overflow-hidden rounded-[28px] border border-[#D8E6F8] bg-[#EEF6FF] p-3 lg:block"><ProductCollage /></div>
          </aside>
        </section>
      </div>
    </ReferencePage>
  );
}
