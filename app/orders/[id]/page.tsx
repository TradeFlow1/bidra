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
      <main className="bd-container pb-28 pt-3 sm:py-10">
        <div className="mx-auto mb-4 w-full max-w-7xl"><BackButton href="/orders" label="Back to orders" /></div>
        <div className="container max-w-7xl space-y-4 sm:space-y-5">
          <div className="overflow-hidden rounded-[30px] border border-[#EDE9FE] bg-[linear-gradient(135deg,#FFFFFF_0%,#FBF9FF_56%,#F5F3FF_100%)] p-4 shadow-[0_22px_64px_rgba(43,16,85,0.09)] sm:rounded-[32px] sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">Order</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Order details</h1>
          </div>
          <Card className="rounded-3xl border border-[#EDE9FE] bg-white p-6 shadow-[0_18px_50px_rgba(43,16,85,0.07)]">
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
      <main className="bd-container pb-28 pt-3 sm:py-10">
        <div className="mx-auto mb-4 w-full max-w-7xl"><BackButton href="/orders" label="Back to orders" /></div>
        <div className="container max-w-7xl space-y-4 sm:space-y-5">
          <div className="overflow-hidden rounded-[30px] border border-[#EDE9FE] bg-[linear-gradient(135deg,#FFFFFF_0%,#FBF9FF_56%,#F5F3FF_100%)] p-4 shadow-[0_22px_64px_rgba(43,16,85,0.09)] sm:rounded-[32px] sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">Order</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Order details</h1>
          </div>
          <Card className="rounded-3xl border border-[#EDE9FE] bg-white p-6 shadow-[0_18px_50px_rgba(43,16,85,0.07)]">
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
  const statusLabel = order.outcome === "COMPLETED" ? "Completed" : "Purchase committed";
  const canLeave =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !order.buyerFeedbackAt) || (isSeller && !order.sellerFeedbackAt));
  const alreadyLeft =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !!order.buyerFeedbackAt) || (isSeller && !!order.sellerFeedbackAt));
  const primaryNextAction = order.outcome === "COMPLETED"
    ? (canLeave ? "Share feedback for this completed order." : "Feedback has been submitted.")
    : "Buy now is committed. Arrange payment, pickup/postage and handover in Messages.";
  const primaryNextHref = order.outcome === "COMPLETED" ? feedbackHref : messageHref;
  const primaryNextLabel = order.outcome === "COMPLETED" ? "Feedback" : (isBuyer ? "Message seller" : "Message buyer");

  return (
    <main className="bd-container pb-28 pt-3 sm:py-10">
        <div className="mx-auto mb-3 w-full max-w-7xl"><BackButton href="/orders" label="Back to orders" /></div>
        <div className="container max-w-7xl space-y-4 sm:space-y-5">
        <div className="overflow-hidden rounded-[30px] border border-[#EDE9FE] bg-[linear-gradient(135deg,#FFFFFF_0%,#FBF9FF_56%,#F5F3FF_100%)] p-4 shadow-[0_22px_64px_rgba(43,16,85,0.09)] sm:rounded-[32px] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-[#E8E2EF] bg-white px-3 py-1.5 text-xs font-semibold text-[#17131F] shadow-sm">
                  {roleLabel}
                </span>
                <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-black ${statusTone(String(order.status), order.outcome)}`}>
                  {statusLabel}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-black leading-[1.05] tracking-[-0.05em] text-[#17131F] sm:text-4xl">{order.listing?.title ?? "Purchased item"}</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#4F475D] sm:text-base">
                This Buy now order is a committed purchase. Use Messages to arrange payment, pickup/postage and handover.
              </p>
              <div className="mt-5 rounded-[20px] border border-[#E8E2EF] bg-white px-4 py-3 text-sm leading-6 text-[#4F475D] shadow-sm">
                <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#6F3FF5]">Next action</div>
                <div className="mt-1 font-bold">{primaryNextAction}</div>
              </div>
              <div className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#64748B]">
                Created <DateTimeText value={order.createdAt} />
              </div>
            </div>

            <div className="grid gap-2.5 sm:min-w-[360px] sm:grid-cols-3 lg:w-[360px]">
                <Link href={primaryNextHref} className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-[18px] bg-[#6F3FF5] px-4 text-center text-sm font-semibold !text-white shadow-sm transition active:scale-[0.99]">
                {primaryNextLabel}
              </Link>
              <Link href={listingHref} className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-[18px] border border-[#E8E2EF] bg-white px-4 text-center text-sm font-semibold text-[#17131F] shadow-sm transition active:scale-[0.99]">
                View item
              </Link>
              <Link href="/disputes" className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-[18px] border border-[#E8E2EF] bg-white px-4 text-center text-sm font-semibold text-[#17131F] shadow-sm transition active:scale-[0.99]">
                Get help
              </Link>
              {alreadyLeft ? (
                <span className="col-span-3 inline-flex items-center justify-center rounded-2xl border border-[#E8E2EF] bg-white px-4 py-3 text-center text-sm font-semibold text-[#17131F] shadow-sm">
                  Feedback sent
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="bd-order-stat rounded-[24px] border border-[#EDE9FE] bg-white p-4 shadow-[0_16px_44px_rgba(43,16,85,0.06)]">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Order ID</div>
            <div className="mt-1 text-xl font-black tracking-[-0.03em] text-[#17131F]">{String(order.id).slice(-6)}</div>
            <div className="mt-1 hidden break-all font-mono text-xs text-[#4F475D] sm:block">{order.id}</div>
          </div>

          <div className="bd-order-stat rounded-[24px] border border-[#EDE9FE] bg-white p-4 shadow-[0_16px_44px_rgba(43,16,85,0.06)]">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Amount</div>
            <div className="mt-1 text-3xl font-black tracking-[-0.05em] text-[#17131F]">{formatMoney(order.amount)}</div>
            <div className="mt-1 text-sm text-[#4F475D]">Final sold price.</div>
          </div>

          <div className="bd-order-stat rounded-[24px] border border-[#EDE9FE] bg-white p-4 shadow-[0_16px_44px_rgba(43,16,85,0.06)]">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Listing</div>
            <div className="mt-1 truncate text-lg font-extrabold tracking-tight text-[#17131F]">{order.listing?.title ?? "Listing"}</div>
            <div className="mt-1 text-sm text-[#4F475D]">Original listing.</div>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-[26px] border border-[#EDE9FE] bg-white p-4 shadow-[0_16px_44px_rgba(43,16,85,0.06)] sm:p-5">
            <div className="text-lg font-black tracking-[-0.02em] text-[#120724]">Order checklist</div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-semibold leading-6 text-[#62516F]">
              <li>Buy now means the item has been bought and removed from sale.</li>
              <li>Use Messages to arrange payment, pickup/postage and handover.</li>
              <li>Report no-shows or flaky behaviour from the order if handover breaks down.</li>
            </ul>

            <details className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <summary className="cursor-pointer select-none font-extrabold">Safety checkpoint</summary>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>Use a public place where practical.</li>
                <li>Pause and contact Support if terms suddenly change.</li>
              </ul>
            </details>
          </Card>
            <div className="rounded-[26px] border border-[#EDE9FE] bg-white px-4 py-4 text-sm leading-6 text-[#62516F] shadow-[0_16px_44px_rgba(43,16,85,0.06)]">
              <div className="text-lg font-black tracking-[-0.02em] text-[#120724]">Need help with this order?</div>
              <p className="mt-1">Use the Resolution Centre or contact Support if the buyer or seller does not follow through.</p>
              <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                <Link href="/disputes" className="bd-btn bd-btn-secondary inline-flex h-11 items-center justify-center rounded-2xl px-4 text-center text-sm font-black shadow-sm transition">Help</Link>
                <Link href="/contact" className="bd-btn bd-btn-secondary inline-flex h-11 items-center justify-center rounded-2xl px-4 text-center text-sm font-black shadow-sm transition">Contact</Link>
              </div>
            </div>
        </div>
      </div>
    </main>
  );
}
