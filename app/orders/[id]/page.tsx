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
  return "bg-neutral-100 border-[#D7E2F1] text-neutral-800";
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
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          price: true,
          buyNowPrice: true,
          location: true,
          sellerId: true,
          images: true,
          photos: true,
          status: true,
          createdAt: true,
        },
      },
    }
  });

  if (!order) {
    return (
      <main className="bd-container py-6 sm:py-10">
        <div className="mx-auto mb-4 w-full max-w-7xl"><BackButton href="/orders" label="Back to orders" /></div>
        <div className="container max-w-7xl space-y-3 sm:space-y-4">
          <div className="rounded-[28px] border border-[#D7E2F1] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">Order</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Sold item</h1>
          </div>
          <Card className="rounded-3xl border border-[#D7E2F1] bg-white p-6 shadow-sm hover:bg-[#F5F3FF]">
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
        <div className="mx-auto mb-4 w-full max-w-7xl"><BackButton href="/orders" label="Back to orders" /></div>
        <div className="container max-w-7xl space-y-3 sm:space-y-4">
          <div className="rounded-[28px] border border-[#D7E2F1] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">Order</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Sold item</h1>
          </div>
          <Card className="rounded-3xl border border-[#D7E2F1] bg-white p-6 shadow-sm hover:bg-[#F5F3FF]">
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
  const canLeave =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !order.buyerFeedbackAt) || (isSeller && !order.sellerFeedbackAt));
  const alreadyLeft =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !!order.buyerFeedbackAt) || (isSeller && !!order.sellerFeedbackAt));
  const primaryNextAction = order.outcome === "COMPLETED"
    ? (canLeave ? "Share feedback for this completed order." : "Feedback has been submitted.")
    : "Review the details below, then message if anything needs confirming.";
  const primaryNextHref = order.outcome === "COMPLETED" ? feedbackHref : messageHref;
  const primaryNextLabel = order.outcome === "COMPLETED" ? "Feedback" : "Message";

  return (
    <main className="bd-container py-6 sm:py-10">
        <div className="mx-auto mb-4 w-full max-w-7xl px-4"><BackButton href="/orders" label="Back to orders" /></div>
        <div className="container max-w-7xl space-y-4">
        <div className="rounded-[28px] border border-[#D7E2F1] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-[#D7E2F1] bg-white px-2.5 py-1 text-xs font-semibold text-neutral-800 shadow-sm hover:bg-[#F5F3FF]">
                  {roleLabel}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(String(order.status), order.outcome)}`}>
                  {statusLabel}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Sold item</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Order details are the source of truth. Use Messages for quick confirmations.
              </p>
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950 shadow-sm">
                <div className="font-extrabold">Next action</div>
                <div className="mt-1">{primaryNextAction}</div>
              </div>
              <div className="mt-3 text-sm bd-ink2">
                Created <DateTimeText value={order.createdAt} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[360px] lg:w-[360px]">
              <Link href={primaryNextHref} className="whitespace-nowrap rounded-2xl bg-[#061126] px-4 py-3 text-center text-sm font-extrabold text-white shadow-sm transition hover:opacity-90">
                {primaryNextLabel}
              </Link>
              <Link href={listingHref} className="whitespace-nowrap rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-center text-sm font-extrabold text-[#0B4DFF] shadow-sm transition hover:bg-[#F8FAFC] hover:bg-[#F5F3FF]">
                Item
              </Link>
              <Link href="/disputes" className="whitespace-nowrap rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-center text-sm font-extrabold text-[#0B4DFF] shadow-sm transition hover:bg-[#F8FAFC] hover:bg-[#F5F3FF]">
                Help
              </Link>
              {alreadyLeft ? (
                <span className="col-span-3 inline-flex items-center justify-center rounded-2xl border border-[#D7E2F1] bg-white px-4 py-3 text-center text-sm font-semibold bd-ink shadow-sm hover:bg-[#F5F3FF]">
                  Feedback sent
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#D7E2F1] bg-white p-4 shadow-sm hover:bg-[#F5F3FF]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Order ID</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-[#07152E]">{String(order.id).slice(-6)}</div>
            <div className="mt-1 text-sm text-[#526173] font-mono break-all">{order.id}</div>
          </div>

          <div className="rounded-2xl border border-[#D7E2F1] bg-white p-4 shadow-sm hover:bg-[#F5F3FF]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Amount</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-[#07152E]">{formatMoney(order.amount)}</div>
            <div className="mt-1 text-sm text-[#526173]">Final sold price.</div>
          </div>

          <div className="rounded-2xl border border-[#D7E2F1] bg-white p-4 shadow-sm hover:bg-[#F5F3FF]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Listing</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-[#07152E] truncate">{order.listing?.title ?? "Listing"}</div>
            <div className="mt-1 text-sm text-[#526173]">Original listing.</div>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-[24px] border border-[#D7E2F1] bg-white p-4 shadow-sm sm:p-5 hover:bg-[#F5F3FF]">
            <div className="text-sm font-extrabold bd-ink">Order checklist</div>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm bd-ink2">
              <li>Check the item, amount, status, and order ID.</li>
              <li>Use Messages for any final confirmations.</li>
              <li>Leave feedback when the order is completed.</li>
            </ul>

            <details className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <summary className="cursor-pointer select-none font-extrabold">Safety checkpoint</summary>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>Use a public place where practical.</li>
                <li>Pause and contact Support if terms suddenly change.</li>
              </ul>
            </details>
          </Card>
            <div className="rounded-2xl border border-[#D7E2F1] bg-white px-4 py-3 text-sm bd-ink2 shadow-sm hover:bg-[#F5F3FF]">
              <div className="font-extrabold">Need help with this order?</div>
              <p className="mt-1">Use the Resolution Centre or contact Support if something does not look right.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/disputes" className="rounded-2xl border border-[#D8E1F0] bg-white px-4 py-2.5 text-center text-sm font-extrabold text-[#0B4DFF] shadow-sm transition hover:bg-[#F8FAFC] hover:bg-[#F5F3FF]">Help</Link>
                <Link href="/contact" className="rounded-2xl border border-[#D8E1F0] bg-white px-4 py-2.5 text-center text-sm font-extrabold text-[#0B4DFF] shadow-sm transition hover:bg-[#F8FAFC] hover:bg-[#F5F3FF]">Contact</Link>
              </div>
            </div>
        </div>
      </div>
    </main>
  );
}
