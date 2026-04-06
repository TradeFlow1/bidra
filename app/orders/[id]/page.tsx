import Link from "next/link";
import SellerConfirmReceived from "./seller-confirm-received";
import SellerPickupOptionsForm from "./seller-pickup-options-form";
import BuyerPickupSelect from "./buyer-pickup-select";
import RescheduleRequest from "./reschedule-request";
import NoShowReport from "./no-show-report";
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
    include: { listing: true },
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
  const pickupOptions = Array.isArray(order.pickupOptions)
    ? order.pickupOptions.map(function (x) { return String(x); })
    : [];
  const reschedulePending = !!order.rescheduleRequestedAt;
  const rescheduleRequestedByRole = order.rescheduleRequestedByRole ? String(order.rescheduleRequestedByRole) : null;
  const rescheduleReason = order.rescheduleReason ? String(order.rescheduleReason) : null;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-4xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Order</h1>
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
            <div className="grid gap-3">
              <div className="text-sm bd-ink2">
                Order: <code className="font-mono">{order.id}</code>
              </div>

              <div className="text-lg font-extrabold">
                {order.listing?.title ?? "Listing"}
              </div>

              <div className="text-sm bd-ink2">
                Amount: <b>${(order.amount / 100).toFixed(2)}</b> AUD
              </div>

              <OrderStatusTimeline status={order.status} outcome={order.outcome} className="mt-3" />

              {order.pickupScheduledAt ? (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
                  <div className="font-semibold">Current pickup time</div>
                  <div className="mt-1">{new Date(order.pickupScheduledAt).toLocaleString()}</div>
                  {reschedulePending ? (
                    <div className="mt-2 text-xs text-green-900">
                      This remains the binding pickup time until a replacement time is chosen.
                    </div>
                  ) : null}
                </div>
              ) : null}

              {reschedulePending ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <div className="font-semibold">Reschedule in progress</div>
                  <div className="mt-1">
                    Requested by: <b>{rescheduleRequestedByRole || "Unknown"}</b>
                  </div>
                  {rescheduleReason ? <div className="mt-1">Reason: {rescheduleReason}</div> : null}
                  {isBuyer ? (
                    <div className="mt-2">
                      {pickupOptions.length ? "Replacement pickup options are ready below. Choose one to update the schedule." : "Waiting for the seller to post replacement pickup options."}
                    </div>
                  ) : null}
                  {isSeller ? (
                    <div className="mt-2">
                      Post replacement pickup options below so the buyer can choose a new time.
                    </div>
                  ) : null}
                </div>
              ) : null}

              {(order.status === "PICKUP_SCHEDULED" && isBuyer && order.outcome !== "COMPLETED") ? (
                <>
                  <RescheduleRequest orderId={order.id} />
                  <NoShowReport orderId={order.id} />
                </>
              ) : null}

              {(order.status === "PICKUP_REQUIRED" && isBuyer) ? (
                <div className="pt-2">
                  <SafetyCallout title="Safety">
                    <ul className="list-disc pl-5">
                      <li>Keep communication on Bidra via Messages for clarification only.</li>
                      <li>Wait for the seller to provide pickup options, then choose one in-app.</li>
                      <li>If anything feels suspicious, stop and report it.</li>
                    </ul>
                  </SafetyCallout>

                  <div className="mt-3 rounded-xl border border-black/10 bg-white/5 px-4 py-3 text-sm bd-ink2">
                    {pickupOptions.length ? "Choose one of the seller-defined pickup options below." : "Waiting for seller pickup availability."}
                  </div>
                  {(order.status === "PICKUP_REQUIRED" && isBuyer && pickupOptions.length > 0) ? (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                      <div className="font-semibold">Action required</div>
                      <div className="mt-1">Choose a pickup time to complete scheduling.</div>
                    </div>
                  ) : null}
                  <BuyerPickupSelect orderId={order.id} options={pickupOptions} />
                </div>
              ) : null}

              {(order.status === "PICKUP_SCHEDULED" && isBuyer && reschedulePending && pickupOptions.length > 0) ? (
                <div className="pt-2">
                  <BuyerPickupSelect orderId={order.id} options={pickupOptions} />
                </div>
              ) : null}

              {order.listing?.sellerId === user.id && order.status === "PICKUP_REQUIRED" ? (
                <div className="pt-2">
                  <SafetyCallout title="Next step">
                    <ul className="list-disc pl-5">
                      <li>This is a binding order.</li>
                      <li>After purchase, provide pickup options here so the buyer can choose in-app.</li>
                    </ul>
                  </SafetyCallout>

                  {(order.status === "PICKUP_REQUIRED" && isSeller) ? (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                      <div className="font-semibold">Action required</div>
                      <div className="mt-1">Add pickup options here after the sale. The buyer will choose one in-app to lock the schedule.</div>
                    </div>
                  ) : null}
                  <SellerPickupOptionsForm orderId={order.id} />
                </div>
              ) : null}

              {(order.status === "PICKUP_SCHEDULED" && isSeller && reschedulePending) ? (
                <div className="pt-2">
                  <SellerPickupOptionsForm orderId={order.id} />
                </div>
              ) : null}

              {order.listing?.sellerId === user.id && order.status === "PICKUP_SCHEDULED" && order.outcome !== "COMPLETED" ? (
                <>
                  <SellerConfirmReceived orderId={order.id} />
                  <NoShowReport orderId={order.id} />
                  <RescheduleRequest orderId={order.id} />
                </>
              ) : null}

              <div className="pt-2">
                <div className="text-xs bd-ink2">
                  <Card className="bd-card p-6">
                    <div className="grid gap-2">
                      <div className="text-sm font-extrabold bd-ink">What happens next</div>
                      {order.status === "PICKUP_REQUIRED" ? (
                        <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                          <li><b>Pickup options</b> are provided by the seller after purchase.</li>
                          <li>The buyer then chooses one option and the schedule is locked. Messages do not override the scheduled flow.</li>
                          <li>Keep communication on Bidra in <Link className="bd-link font-semibold" href="/messages">Messages</Link> for clarification only.</li>
                        </ul>
                      ) : order.status === "PICKUP_SCHEDULED" ? (
                        <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                          <li>This order is now in the <b>pickup scheduled</b> stage.</li>
                          <li>The current scheduled time stays binding until a replacement time is chosen in the order.</li>
                          <li>Honour the agreed time and use Messages only for clarification.</li>
                          <li>After the handover, leave feedback to help build trust.</li>
                        </ul>
                      ) : order.outcome === "COMPLETED" ? (
                        <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                          <li>This order is marked <b>COMPLETED</b>.</li>
                          <li>You can leave feedback anytime from this order.</li>
                        </ul>
                      ) : (
                        <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                          <li>Check the order status above for the current step. Follow the scheduled pickup flow shown in the order.</li>
                          <li>Keep communication on Bidra in <Link className="bd-link font-semibold" href="/messages">Messages</Link> for clarification only.</li>
                        </ul>
                      )}
                    </div>
                  </Card>

                  This order is binding. Bidra records confirmations and scheduling. The scheduled pickup flow controls the order, and messages do not override it.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}