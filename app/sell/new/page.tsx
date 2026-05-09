import SellNewClient from "./sell-new-client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFeedbackGate } from "@/lib/feedback-gate";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { BackButton } from "@/components/ui/back-button";

export const dynamic = "force-dynamic";

function buildDefaultLocation(u: { suburb?: string | null; state?: string | null; postcode?: string | null }) {
  const suburb = (u.suburb || "").trim();
  const state = (u.state || "").trim().toUpperCase();
  const postcode = (u.postcode || "").trim();

  const left: string[] = [];
  if (postcode) left.push(postcode);
  if (suburb) left.push(suburb);

  const leftText = left.join(" ").trim();
  const rightText = state ? state : "";

  if (leftText && rightText) return leftText + ", " + rightText;
  return leftText || rightText || "";
}
export default async function SellNewPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?next=/sell/new");
  }

  const gate = await getFeedbackGate(session.user.id, 48);

  if (gate.blocked) {
    return (
      <main className="bd-container py-10">
      <div className="mx-auto mb-4 w-full max-w-6xl px-4"><BackButton href="/dashboard" label="Back to dashboard" /></div>
        <div className="container max-w-5xl">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Finish feedback before selling</h1>

          <p className="mt-2 text-sm bd-ink2">
            You have {gate.pendingCount} pending feedback task(s) older than {gate.graceHours} hours.
            Bidra pauses new listings until overdue feedback is complete so buyers and sellers can rely on recent transaction history.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={gate.feedbackUrl || "/orders"} className="bd-btn bd-btn-primary">
              Complete feedback
            </a>

            <a href="/orders" className="bd-btn bd-btn-ghost">
              View orders
            </a>
          </div>
        </div>
      </main>
    );
  }

  const userRow = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { suburb: true, state: true, postcode: true },
  });

  const defaultLocation = userRow ? buildDefaultLocation(userRow) : "";

  return (
    <main className="bd-container py-10">
      <div className="mx-auto mb-4 w-full max-w-6xl px-4"><BackButton href="/dashboard" label="Back to dashboard" /></div>
      <div className="container max-w-5xl">
        <PageHeader
          title="Create a buyer-ready listing"
          eyebrow="Sell on Bidra"
          backHref="/listings"
          backLabel="Back to marketplace"
          description="Follow the first-listing checklist: clear photos, accurate condition, local pickup or postage context, simple pricing, and handover notes that keep buyers confident before they message or buy."
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="bd-card p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-neutral-500">Step 1</div>
            <div className="mt-1 text-sm font-extrabold bd-ink">Photos and condition</div>
            <p className="mt-1 text-xs bd-ink2">Show the actual item and mention marks, faults, size, model, and what is included.</p>
          </div>
          <div className="bd-card p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-neutral-500">Step 2</div>
            <div className="mt-1 text-sm font-extrabold bd-ink">Price and sale path</div>
            <p className="mt-1 text-xs bd-ink2">Choose Buy Now for a clear fixed price or timed offers when you want to review interest.</p>
          </div>
          <div className="bd-card p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-neutral-500">Step 3</div>
            <div className="mt-1 text-sm font-extrabold bd-ink">Safe handover notes</div>
            <p className="mt-1 text-xs bd-ink2">Use suburb, state, pickup or postage notes, tracking expectations, and keep final details in Messages.</p>
          </div>
        </div>
        <div className="mt-4 rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm leading-7 text-blue-950">
          <div className="font-extrabold">Postage readiness</div>
          <p className="mt-1">If you offer postage, say whether the buyer or seller pays postage, whether tracking will be used, how quickly you can dispatch, and how packaging risk is handled. Bidra does not currently sell labels, calculate carrier rates, insure delivery, or manage carrier claims.</p>
        </div>

        <div className="mt-6">
          <SellNewClient defaultLocation={defaultLocation} />
        </div>
      </div>
    </main>
  );
}
