import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";
import SafetyCallout from "../../../components/safety-callout";
import OrderStatusTimeline from "../../../components/order-status-timeline";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        <div className="container max-w-4xl">
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Order</h1>
            <p className="mt-2 text-sm bd-ink2">Order not found.</p>
            <div className="mt-5">
              <Link className="bd-btn bd-btn-ghost text-center" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (order.buyerId !== user.id && order.listing?.sellerId !== user.id) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-4xl">
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Order</h1>
            <p className="mt-2 text-sm bd-ink2">You do not have access to this order.</p>
            <div className="mt-5">
              <Link className="bd-btn bd-btn-ghost text-center" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const listingHref = `/listings/${order.listingId}`;
  const feedbackHref = `/orders/${order.id}/feedback`;
  const isBuyer = order.buyerId === user.id;
  const isSeller = order.listing?.sellerId === user.id;
  const canLeave =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !order.buyerFeedbackAt) || (isSeller && !order.sellerFeedbackAt));
  const alreadyLeft =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !!order.buyerFeedbackAt) || (isSeller && !!order.sellerFeedbackAt));

  return (
    <main className="bd-container py-10">
      <div className="container max-w-4xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Order details</h1>
              <div className="text-sm bd-ink2 mt-1">
                <Badge>{order.outcome === "COMPLETED" ? "COMPLETED" : order.status}</Badge>{" "}
                <span className="ml-2">Created <DateTimeText value={order.createdAt} /></span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/orders" className="bd-btn bd-btn-primary text-center">Orders</Link>
              <Link href={listingHref} className="bd-btn bd-btn-primary text-center">View listing</Link>
              {canLeave ? (
                <Link href={feedbackHref} className="bd-btn bd-btn-primary text-center">
                  Leave feedback
                </Link>
              ) : null}
              {alreadyLeft ? (
                <span className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/5 px-4 py-2.5 text-sm font-semibold bd-ink">
                  Feedback submitted
                </span>
              ) : null}
            </div>
          </div>

          <Card className="bd-card p-6">
            <div className="grid gap-4">
              <div className="text-sm bd-ink2">
                Order: <code className="font-mono">{order.id}</code>
              </div>

              <div className="text-lg font-extrabold">
                {order.listing?.title ?? "Listing"}
              </div>

              <div className="text-sm bd-ink2">
                Amount: <b>${(order.amount / 100).toFixed(2)}</b> AUD
              </div>

              <OrderStatusTimeline status={order.status} />

              {order.status === "PENDING" ? (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  <div className="font-semibold">Next step</div>
                  <div className="mt-1">
                    Use Messages to confirm pickup, delivery, or postage details directly with the other party.
                  </div>
                </div>
              ) : null}

              {order.status === "ACCEPTED" ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <div className="font-semibold">Order accepted</div>
                  <div className="mt-1">
                    This order is in progress. Keep communication in Messages and complete the handover safely.
                  </div>
                </div>
              ) : null}

              {order.outcome === "COMPLETED" ? (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
                  <div className="font-semibold">Order completed</div>
                  <div className="mt-1">
                    This order has been marked complete.
                  </div>
                </div>
              ) : null}

              <SafetyCallout title="Safety guidance">
                <ul className="list-disc pl-5">
                  <li>Keep communication on Bidra in <Link className="bd-link font-semibold" href="/messages">Messages</Link>.</li>
                  <li>Meet in a safe public place for pickup where practical.</li>
                  <li>Use tracked delivery or postage where appropriate.</li>
                  <li>If anything feels suspicious, stop and report it.</li>
                </ul>
              </SafetyCallout>

              <Card className="bd-card p-6">
                <div className="grid gap-2">
                  <div className="text-sm font-extrabold bd-ink">What to expect</div>
                  {order.outcome === "COMPLETED" ? (
                    <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                      <li>This order is marked <b>COMPLETED</b>.</li>
                      <li>You can leave feedback from this order.</li>
                    </ul>
                  ) : order.status === "PENDING" ? (
                    <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                      <li>This is a live order waiting for coordination.</li>
                      <li>Use <Link className="bd-link font-semibold" href="/messages">Messages</Link> to confirm pickup, delivery, or postage details.</li>
                      <li>Once both sides are aligned and the transaction is underway, the seller can progress the order.</li>
                    </ul>
                  ) : order.status === "ACCEPTED" ? (
                    <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                      <li>This order has been accepted and is in progress.</li>
                      <li>Complete the exchange safely and keep communication in Bidra.</li>
                      <li>After the handover, leave feedback to help build trust.</li>
                    </ul>
                  ) : (
                    <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                      <li>Check the order status above for the current step.</li>
                      <li>Keep communication on Bidra in <Link className="bd-link font-semibold" href="/messages">Messages</Link>.</li>
                    </ul>
                  )}
                </div>
              </Card>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}