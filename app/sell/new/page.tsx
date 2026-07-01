import Link from "next/link";
import SellNewClient from "./sell-new-client";
import SellNewQualityGate from "@/components/sell-new-quality-gate";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFeedbackGate } from "@/lib/feedback-gate";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/ui/back-button";
import { AppPanel, ReferencePage, appShell } from "@/components/marketplace-redesign";

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
        <div className={appShell + " py-6"}>
          <BackButton href="/dashboard" label="Back to dashboard" />
          <AppPanel className="mt-4">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6D28D9]">Before selling</div>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#120724]">Finish feedback</h1>
            <p className="mt-2 text-sm font-semibold text-[#62516F]">You have {gate.pendingCount} pending feedback task(s) older than {gate.graceHours} hours.</p>
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
      <div className={appShell + " py-5 sm:py-7"}>
        <BackButton href="/dashboard" label="Back to dashboard" />
        <section className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1120px)_320px] xl:justify-center xl:items-start">
          <div>
            <div className="rounded-[24px] border border-[#E8E2EF] bg-[#F7F5FA] p-5 shadow-[0_10px_28px_rgba(15,12,22,0.04)] sm:p-7">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6F3FF5]">Sell on Bidra</div>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#17131F] sm:text-5xl">Sell your item</h1>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-[#4F475D] sm:text-base">Add photos, details, price and location. Buyers and sellers arrange payment, pickup, postage and handover directly.</p>
              <div className="mt-5 flex flex-wrap gap-2 text-center text-xs font-semibold text-[#6F3FF5]"><span className="rounded-full border border-[#E8E2EF] bg-white px-3 py-2 shadow-sm">Details</span><span className="rounded-full border border-[#E8E2EF] bg-white px-3 py-2 shadow-sm">Photos</span><span className="rounded-full border border-[#E8E2EF] bg-white px-3 py-2 shadow-sm">Review</span><Link href="/sell/bulk" className="rounded-full border border-[#E8E2EF] bg-white px-3 py-2 shadow-sm underline-offset-2 hover:bg-[#F7F5FA] hover:underline">Bulk/photo prep</Link></div>
            </div>
            <div className="mt-4 grid gap-4"><SellNewQualityGate /><SellNewClient defaultLocation={defaultLocation} /></div>
          </div>
          <aside className="hidden gap-4 xl:sticky xl:top-24 xl:grid">
            <AppPanel>
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6F3FF5]">Listing quality</div>
              <h2 className="mt-2 text-xl font-black tracking-tight text-[#17131F]">Buyer-ready checklist</h2>
              <ul className="mt-4 space-y-3 text-sm font-medium leading-6 text-[#4F475D]">
                <li>Hero photo shows the real item clearly.</li>
                <li>Title names the item, model or size.</li>
                <li>Condition, faults and inclusions are explicit.</li>
                <li>Price and offer settings match your intent.</li>
                <li>Pickup, postage or delivery expectations are clear.</li>
              </ul>
              <Link href="/sell/bulk" className="mt-5 inline-flex h-11 items-center rounded-2xl border border-[#E8E2EF] bg-white px-4 text-sm font-semibold text-[#17131F]">Prepare photos</Link>
            </AppPanel>
            <AppPanel tone="dark">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#D8CDF8]">Seller profile</div>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">Build trust with every listing.</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-white/75">Clear photos, accurate details and on-platform messages help buyers make confident decisions.</p>
            </AppPanel>
          </aside>
        </section>
      </div>
    </ReferencePage>
  );
}
