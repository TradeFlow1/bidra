import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";
import { BackButton } from "@/components/ui/back-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatMoney(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;
  return `$${(Number(value) / 100).toFixed(2)} AUD`;
}

function statusTone(status: string, outcome: string | null | undefined) {
  if (outcome === "COMPLETED") return "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (status === "PENDING") return "bg-blue-50 border-blue-200 text-blue-900";
  if (status === "ACCEPTED") return "bg-amber-50 border-amber-200 text-amber-900";
  return "bg-neutral-100 border-black/10 text-neutral-800";
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect(`/auth/login?next=/orders/${params.id}`);

  const gate = await requireAdult(session);
  if (!gate.ok) redirect("/account/restrictions");

  const orderId = params.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { listing: true }
  });

  if (!order) {
    return (
      <main className="bd-container py-6 sm:py-10">
        <div className="mx-auto mb-4 w-full max-w-4xl"><BackButton href="/orders" label="Back to orders" /></div>
        <div className="container max-w-4xl space-y-3 sm:space-y-4">
          <div className="rounded-[28px] border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-4 shadow-sm sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Order</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Sold item</h1>
          </div>
          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-base font-semibold bd-ink">Order not found</div>
            <p className="mt-2 text-sm bd-ink2">This order could not be found, may have moved, or may not be available to this account.</p>
            <div className="mt-5">
              <Link className="bd-btn bd-btn-secondary text-center" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (order.buyerId !== user.id && order.listing?.sellerId !== user.id) {
    return (
      <main className="bd-container py-6 sm:py-10">
        <div className="mx-auto mb-4 w-full max-w-4xl"><BackButton href="/orders" label="Back to orders" /></div>
        <div className="container max-w-4xl space-y-3 sm:space-y-4">
          <div className="rounded-[28px] border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-4 shadow-sm sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Order</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Sold item</h1>
          </div>
          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-base font-semibold bd-ink">Access restricted</div>
            <p className="mt-2 text-sm bd-ink2">You do not have access to this order.</p>
            <div className="mt-5">
              <Link className="bd-btn bd-btn-secondary text-center" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const listingHref = `/listings/${order.listingId}`;
  const messageHref = `/orders/${order.id}/message`;
  const feedbackHref = `/orders/${order.id}/feedback`;
  const isBuyer = order.buyerId === user.id;
  const isSeller = order.listing?.sellerId === user.id;
  const roleLabel = isBuyer ? "Buyer" : "Seller";
  const statusLabel = order.outcome === "COMPLETED" ? "Completed" : "Sold";
  const primaryNextAction = order.outcome === "COMPLETED"
    ? "Feedback is available for this completed order."
    : "Arrange payment, pickup or postage, and handover with the other person.";
  const primaryNextHref = order.outcome === "COMPLETED" ? feedbackHref : messageHref;
  const primaryNextLabel = order.outcome === "COMPLETED" ? "Feedback" : "Message";
  const canLeave =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !order.buyerFeedbackAt) || (isSeller && !order.sellerFeedbackAt));
  const alreadyLeft =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !!order.buyerFeedbackAt) || (isSeller && !!order.sellerFeedbackAt));

  return (
    <main className="bd-container py-6 sm:py-10">
        <div className="mx-auto mb-4 w-full max-w-4xl"><BackButton href="/orders" label="Back to orders" /></div>
        <div className="container max-w-4xl space-y-3 sm:space-y-4">
        <div className="rounded-[28px] border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-800 shadow-sm">
                  {roleLabel}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(String(order.status), order.outcome)}`}>
                  {statusLabel}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Sold item</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Open the order, arrange the handover, and keep important details in Messages.
              </p>
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
                <div className="font-extrabold">Next action</div>
                <div className="mt-1">{primaryNextAction}</div>
              </div>
              <div className="mt-3 text-sm bd-ink2">
                Created <DateTimeText value={order.createdAt} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[320px] lg:w-[320px]">
              <Link href={primaryNextHref} className="whitespace-nowrap rounded-2xl bg-[#061126] px-4 py-3 text-center text-sm font-extrabold text-white shadow-sm transition hover:opacity-90">
                {primaryNextLabel}
              </Link>
              <Link href={listingHref} className="whitespace-nowrap rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-center text-sm font-extrabold text-[#0B4DFF] shadow-sm transition hover:bg-[#F8FAFC]">
                Item
              </Link>
              <Link href="/disputes" className="whitespace-nowrap rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-center text-sm font-extrabold text-[#0B4DFF] shadow-sm transition hover:bg-[#F8FAFC]">
                Help
              </Link>
              {canLeave ? (
                <Link href={feedbackHref} className="bd-btn bd-btn-secondary text-center">
                  Leave feedback
                </Link>
              ) : null}
              {alreadyLeft ? (
                <span className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold bd-ink shadow-sm">
                  Feedback submitted
                </span>
              ) : null}
            </div>
            <p className="text-sm bd-ink2">
              Use the highlighted next action above to keep the transaction moving.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Order ID</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{String(order.id).slice(-6)}</div>
            <div className="mt-1 text-sm text-neutral-600 font-mono break-all">{order.id}</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Amount</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{formatMoney(order.amount)}</div>
            <div className="mt-1 text-sm text-neutral-600">Final sold price.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Listing</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950 truncate">{order.listing?.title ?? "Listing"}</div>
            <div className="mt-1 text-sm text-neutral-600">Original listing.</div>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-[24px] border border-black/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="text-sm font-extrabold bd-ink">Order checklist</div>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm bd-ink2">
              <li>Confirm payment, pickup or postage, and handover details before exchange.</li>
              <li>Keep important agreements in Bidra Messages.</li>
              <li>Leave feedback after the order is completed.</li>
            </ul>

            <details className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <summary className="cursor-pointer select-none font-extrabold">Handover safety checkpoint</summary>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>Confirm the item, amount, payment expectation, location or postage method, and timing.</li>
                <li>Use a public pickup location where practical.</li>
                <li>For postage, agree carrier, tracking, packaging, dispatch timing, and who carries delivery risk.</li>
                <li>If terms suddenly change or payment feels unsafe, stop and contact Support.</li>
              </ul>
            </details>
          </Card>
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
              <div className="font-extrabold">Need help with this order?</div>
              <p className="mt-1">Use the Resolution Centre if pickup, postage, payment, or handover does not go as agreed.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/disputes" className="bd-btn bd-btn-secondary text-center">Resolution centre</Link>
                <Link href="/contact" className="bd-btn bd-btn-secondary text-center">Contact support</Link>
              </div>
            </div>
        </div>
      </div>
    </main>
  );
}
