import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";
import SafetyCallout from "../../../components/safety-callout";

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
      <main className="bd-container py-10">
        <div className="container max-w-5xl space-y-5">
          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Order</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Sold item</h1>
          </div>
          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-base font-semibold bd-ink">Order not found</div>
            <p className="mt-2 text-sm bd-ink2">This order could not be found.</p>
            <div className="mt-5">
              <Link className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (order.buyerId !== user.id && order.listing?.sellerId !== user.id) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-5xl space-y-5">
          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Order</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Sold item</h1>
          </div>
          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-base font-semibold bd-ink">Access restricted</div>
            <p className="mt-2 text-sm bd-ink2">You do not have access to this order.</p>
            <div className="mt-5">
              <Link className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5" href="/orders">Back to Orders</Link>
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
  const statusLabel = "SOLD";
  const canLeave =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !order.buyerFeedbackAt) || (isSeller && !order.sellerFeedbackAt));
  const alreadyLeft =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !!order.buyerFeedbackAt) || (isSeller && !!order.sellerFeedbackAt));

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
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
                This sold-item record confirms the listing has sold. Use messages to arrange pickup or postage.
              </p>
              <div className="mt-3 text-sm bd-ink2">
                Created <DateTimeText value={order.createdAt} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={messageHref} className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">
                {isBuyer ? "Message seller" : "Message buyer"}
              </Link>
              <Link href="/orders" className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">Orders</Link>
              <Link href={listingHref} className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">View listing</Link>
              {canLeave ? (
                <Link href={feedbackHref} className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">
                  Leave feedback
                </Link>
              ) : null}
              {alreadyLeft ? (
                <span className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold bd-ink shadow-sm">
                  Feedback submitted
                </span>
              ) : null}
            </div>
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
          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-sm font-extrabold bd-ink">What happens now</div>
            <ul className="mt-3 list-disc pl-5 text-sm bd-ink2 space-y-2">
              <li>This order is a sold-item record for the completed sale.</li>
              <li>Use messages to arrange pickup or postage with the other person.</li>
              <li>Keep important agreements and handover details in Bidra messages.</li>
              <li>Follow safety guidance for pickup or postage before final handover.</li>
              <li>After completion, leave feedback if it is available for this order.</li>
            </ul>
          </Card>

          <SafetyCallout title="Safety guidance">
            <ul className="list-disc pl-5 space-y-2">
              <li>Keep pickup, postage, and important details in <Link className="bd-link font-semibold" href="/messages">Messages</Link>.</li>
              <li>Meet in a safe public place for pickup where practical.</li>
              <li>Use tracked delivery or postage where appropriate.</li>
              <li>If anything feels suspicious, stop and report it.</li>
            </ul>
          </SafetyCallout>
        </div>
      </div>
    </main>
  );
}
