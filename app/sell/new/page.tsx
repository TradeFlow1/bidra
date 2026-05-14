import SellNewClient from "./sell-new-client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFeedbackGate } from "@/lib/feedback-gate";
import { prisma } from "@/lib/prisma";
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
      <main className="bd-container py-4 sm:py-8">
        <div className="mx-auto mb-3 w-full max-w-3xl px-4">
          <BackButton href="/dashboard" label="Back to dashboard" />
        </div>

        <div className="container max-w-4xl">
          <section className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Before selling</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink">Finish feedback</h1>
            <p className="mt-2 text-sm bd-ink2">
              You have {gate.pendingCount} pending feedback task(s) older than {gate.graceHours} hours.
            </p>

            <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
              <a href={gate.feedbackUrl || "/orders"} className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[#0B4DFF] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0842D6] sm:w-auto">
                Complete feedback
              </a>

              <a href="/orders" className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto">
                View orders
              </a>
            </div>
          </section>
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
    <main className="bd-container py-4 sm:py-8">
      <div className="mx-auto mb-3 w-full max-w-3xl px-4">
        <BackButton href="/dashboard" label="Back to dashboard" />
      </div>

      <div className="container max-w-3xl space-y-3">
        <section className="rounded-[24px] border border-[#D8E1F0] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Sell on Bidra</div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight bd-ink sm:text-3xl">Create listing</h1>
          <p className="mt-2 text-sm bd-ink2 sm:text-base">
            Add photos, details, price, and handover info.
          </p>
        </section>

        <SellNewClient defaultLocation={defaultLocation} />
      </div>
    </main>
  );
}
