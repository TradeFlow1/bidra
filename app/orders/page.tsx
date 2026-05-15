import Link from "next/link";
import AccountNav from "@/components/account-nav";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";
import { BackButton } from "@/components/ui/back-button";
import { ReferencePage, appNarrowShell } from "@/components/marketplace-redesign";

export const dynamic = "force-dynamic";

function formatMoney(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;
  return `$${(Number(value) / 100).toFixed(2)} AUD`;
}

function statusTone(status: string, outcome: string | null | undefined) {
  if (outcome === "COMPLETED") return "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (status === "PENDING") return "bg-blue-50 border-blue-200 text-blue-900";
  return "bg-neutral-100 border-[#D7E2F1] text-neutral-800";
}

export default async function OrdersPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/auth/login?next=/orders");

  const gate = await requireAdult(session);
  if (!gate.ok) redirect("/account/restrictions");

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { buyerId: user.id },
        { listing: { sellerId: user.id } }
      ]
    },
    include: { listing: true },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" }
    ]
  });

  const soldCount = orders.length;
  const feedbackDueCount = orders.filter((o: any) => String(o.outcome) === "COMPLETED" && ((o.buyerId === user.id && !o.buyerFeedbackAt) || (o.listing?.sellerId === user.id && !o.sellerFeedbackAt))).length;
  return (
    <ReferencePage>
      <div className={appNarrowShell + " space-y-4 py-5 sm:py-7"}>
        <AccountNav active="buying" />
        <div className="rounded-[28px] border border-[#D7E2F1] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">Orders</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Track purchases and sales. Open order details to see the next step.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="rounded-[22px] border border-[#D7E2F1] bg-white p-3 shadow-sm sm:p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Orders</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-[#07152E]">{soldCount}</div>
            <div className="mt-1 text-sm text-[#526173]">Buys and sales.</div>
          </div>

          <div className="rounded-[22px] border border-[#D7E2F1] bg-white p-3 shadow-sm sm:p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Feedback due</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-[#07152E]">{feedbackDueCount}</div>
            <div className="mt-1 text-sm text-[#526173]">Awaiting review.</div>
          </div>

        </div>

        {!orders.length ? (
          <div className="rounded-3xl border border-dashed border-[#C8D7EA] bg-[#F8FAFF] px-6 py-12 text-center shadow-sm">
            <div className="mx-auto w-full max-w-xl">
              <div className="text-xl font-extrabold text-[#0F172A]">No buys or sales yet</div>
              <p className="mt-2 text-sm text-[#526173]">
                When you buy an item or a seller accepts an offer, it appears here with the next step.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link href="/listings" className="w-full bd-btn bd-btn-secondary text-center sm:w-auto">Browse listings</Link>
                <Link href="/sell/new" className="w-full bd-btn bd-btn-secondary text-center sm:w-auto">Create a listing</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            {orders.map((o: any) => {
              const isPending = String(o.status) === "PENDING";
              const isCompleted = String(o.outcome) === "COMPLETED";
              const feedbackDue = isCompleted && ((o.buyerId === user.id && !o.buyerFeedbackAt) || (o.listing?.sellerId === user.id && !o.sellerFeedbackAt));
              const feedbackSubmitted = isCompleted && ((o.buyerId === user.id && !!o.buyerFeedbackAt) || (o.listing?.sellerId === user.id && !!o.sellerFeedbackAt));
              const roleLabel = o.buyerId === user.id ? "Buying" : "Selling";
              const nextActionCopy = isCompleted
                ? (feedbackDue ? "Leave feedback." : "No action needed.")
                : (roleLabel === "Selling" ? "Open details." : "Open details.");
              const statusLabel = isCompleted ? "Feedback open" : "Sold";

              return (
                <Card
                  key={o.id}
                  className={`overflow-hidden rounded-[24px] border bg-white p-3 shadow-sm sm:p-5 ${isPending ? "border-blue-300 border-l-4 ring-2 ring-blue-100" : "border-[#D7E2F1]"}`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-[#D7E2F1] bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-800">
                          {roleLabel}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(String(o.status), o.outcome)}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <div className="mt-3 min-w-0">
                        <Link
                          className="block truncate text-lg font-extrabold text-[#07152E] hover:underline underline-offset-4 sm:text-xl"
                          href={`/listings/${o.listingId}`}
                        >
                          {o?.listing?.title ?? "Listing"}
                        </Link>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-[#526173] sm:text-sm">
                        <div>
                          Created <DateTimeText value={o.createdAt} />
                        </div>
                        <div>
                          Order ID <span className="font-mono font-semibold text-neutral-800">{String(o.id).slice(-6)}</span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-end sm:gap-6">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Amount</div>
                          <div className="mt-1 text-lg font-extrabold text-[#07152E]">{formatMoney(o.amount)}</div>
                        </div>

                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Status</div>
                          <div className="mt-1 text-sm font-medium text-[#334155]">{statusLabel}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Next action</div>
                          <div className="mt-1 text-sm font-medium text-[#334155]">{nextActionCopy}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-1 border-t border-[#D8E1F0] pt-3 lg:mt-0 lg:w-[240px] lg:border-t-0 lg:pt-0">
                      <div className="grid grid-cols-3 gap-2">
                        <Link
                          href={`/orders/${o.id}`}
                          className="rounded-2xl border border-[#D8E1F0] bg-white px-3 py-2.5 text-center text-xs font-extrabold text-[#0B4DFF] shadow-sm transition hover:bg-[#F8FAFC]"
                        >
                          Open
                        </Link>
                        <Link
                          href={`/listings/${o.listingId}`}
                          className="rounded-2xl border border-[#D8E1F0] bg-white px-3 py-2.5 text-center text-xs font-extrabold text-[#0B4DFF] shadow-sm transition hover:bg-[#F8FAFC]"
                        >
                          Item
                        </Link>

                        <Link
                          href="/disputes"
                          className="rounded-2xl border border-[#D8E1F0] bg-white px-3 py-2.5 text-center text-xs font-extrabold text-[#0B4DFF] shadow-sm transition hover:bg-[#F8FAFC]"
                        >
                          Help
                        </Link>

                        {feedbackDue ? (
                          <Link
                            href={`/orders/${o.id}/feedback`}
                            className="rounded-2xl border border-[#D8E1F0] bg-white px-3 py-2.5 text-center text-xs font-extrabold text-[#0B4DFF] shadow-sm transition hover:bg-[#F8FAFC]"
                          >
                            Leave feedback
                          </Link>
                        ) : null}

                        {feedbackSubmitted ? (
                          <span className="inline-flex items-center justify-center rounded-xl border border-[#D7E2F1] bg-white px-4 py-3 text-center text-sm font-semibold bd-ink shadow-sm">
                            Feedback submitted
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ReferencePage>
  );
}

