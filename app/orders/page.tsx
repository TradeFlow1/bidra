import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";

export const dynamic = "force-dynamic";

function formatMoney(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;
  return `$${(Number(value) / 100).toFixed(2)} AUD`;
}

function statusTone(status: string, outcome: string | null | undefined) {
  if (outcome === "COMPLETED") return "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (status === "PENDING") return "bg-blue-50 border-blue-200 text-blue-900";
  return "bg-neutral-100 border-black/10 text-neutral-800";
}

export default async function OrdersPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/auth/login");

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
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Orders</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Sold-item records for what you bought or sold. Use messages to finalise pickup or postage.
              </p>
            </div>

          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Sold</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{soldCount}</div>
            <div className="mt-1 text-sm text-neutral-600">Items bought or sold.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Feedback due</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{feedbackDueCount}</div>
            <div className="mt-1 text-sm text-neutral-600">Optional trust follow-up.</div>
          </div>

        </div>

        {!orders.length ? (
          <div className="rounded-3xl border border-dashed border-black/15 bg-neutral-50 px-6 py-12 text-center shadow-sm">
            <div className="mx-auto max-w-xl">
              <div className="text-xl font-extrabold text-neutral-900">No orders yet</div>
              <p className="mt-2 text-sm text-neutral-600">
                When you buy now or a seller accepts your highest offer, sold items will appear here.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link href="/listings" className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">Browse listings</Link>
                <Link href="/sell/new" className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">Create a listing</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((o: any) => {
              const isPending = String(o.status) === "PENDING";
              const isCompleted = String(o.outcome) === "COMPLETED";
              const feedbackDue = isCompleted && ((o.buyerId === user.id && !o.buyerFeedbackAt) || (o.listing?.sellerId === user.id && !o.sellerFeedbackAt));
              const feedbackSubmitted = isCompleted && ((o.buyerId === user.id && !!o.buyerFeedbackAt) || (o.listing?.sellerId === user.id && !!o.sellerFeedbackAt));
              const roleLabel = o.buyerId === user.id ? "Buying" : "Selling";
              const statusLabel = isCompleted ? "FEEDBACK OPEN" : "SOLD";

              return (
                <Card
                  key={o.id}
                  className={`overflow-hidden rounded-3xl border bg-white p-5 shadow-sm ${isPending ? "border-blue-300 border-l-8 ring-2 ring-blue-100" : "border-black/10"}`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-black/10 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-800">
                          {roleLabel}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(String(o.status), o.outcome)}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <div className="mt-3 min-w-0">
                        <Link
                          className="block truncate text-xl font-extrabold text-neutral-950 hover:underline underline-offset-4"
                          href={`/listings/${o.listingId}`}
                        >
                          {o?.listing?.title ?? "Listing"}
                        </Link>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
                        <div>
                          Created <DateTimeText value={o.createdAt} />
                        </div>
                        <div>
                          Order ID <span className="font-mono font-semibold text-neutral-800">{String(o.id).slice(-6)}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-end gap-6">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Amount</div>
                          <div className="mt-1 text-lg font-extrabold text-neutral-950">{formatMoney(o.amount)}</div>
                        </div>

                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</div>
                          <div className="mt-1 text-sm font-medium text-neutral-700">{statusLabel}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-[260px]">
                      {isPending ? (
                        <Link
                          href={`/orders/${o.id}`}
                          className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5"
                        >
                          <span className="block">Order details</span>
                          <span className="mt-1 block text-xs bd-ink2">Arrange pickup or postage</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/orders/${o.id}`}
                          className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5"
                        >
                          <span className="block">Order details</span>
                          <span className="mt-1 block text-xs bd-ink2">Order ID: {String(o.id).slice(-6)}</span>
                        </Link>
                      )}

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                        <Link
                          href={`/listings/${o.listingId}`}
                          className="rounded-xl border border-black/20 bg-white px-4 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5"
                        >
                          View listing
                        </Link>

                        {feedbackDue ? (
                          <Link
                            href={`/orders/${o.id}/feedback`}
                            className="rounded-xl border border-black/20 bg-white px-4 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5"
                          >
                            Leave feedback
                          </Link>
                        ) : null}

                        {feedbackSubmitted ? (
                          <span className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-3 text-center text-sm font-semibold bd-ink shadow-sm">
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
    </main>
  );
}
