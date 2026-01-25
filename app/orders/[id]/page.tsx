import Link from "next/link";
import SellerConfirmReceived from "./seller-confirm-received";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";

export const dynamic = "force-dynamic";
export const revalidate = 0;




export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect(`/auth/login?next=/orders/${params.id}`);

  const gate = await requireAdult(session as any);
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
              <Link className="underline font-semibold" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  // Buyer-only access (matches /orders list logic)
  if (order.buyerId !== user.id && order.listing?.sellerId !== user.id) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-4xl">
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Order</h1>
            <p className="mt-2 text-sm bd-ink2">You do not have access to this order.</p>
            <div className="mt-5">
              <Link className="underline font-semibold" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const listingHref = `/listings/${order.listingId}`;
  const feedbackHref = `/orders/${order.id}/feedback`;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-4xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Order</h1>
              <div className="text-sm bd-ink2 mt-1">
                <Badge>{order.status}</Badge>{" "}
                <span className="ml-2">Created <DateTimeText value={order.createdAt} /></span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/orders" className="bd-btn bd-btn-primary text-center">Orders</Link>
              <Link href={listingHref} className="bd-btn bd-btn-primary text-center">View listing</Link>
              {order.buyerId === user.id ? (
                <Link href={feedbackHref} className="bd-btn bd-btn-primary text-center">Leave feedback</Link>
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

              {(order.status === "PENDING" && order.buyerId === user.id) ? (
                <div className="pt-2">
                  <Link href={`/orders/${order.id}/pay`} className="bd-btn bd-btn-primary text-center">
                    <span className="block">Pay now</span>
                    <span className="mt-1 block text-xs bd-ink2">Binding order — please pay to proceed.</span>
                  </Link>
                </div>
              ) : null}

              {order.listing?.sellerId === user.id && order.status === "PAID" && order.outcome !== "COMPLETED" ? (
                <SellerConfirmReceived orderId={order.id} />
              ) : null}

              <div className="pt-2">
                <p className="text-xs bd-ink2">
                  
                  <Card className="bd-card p-6">
                    <div className="grid gap-2">
                      <div className="text-sm font-extrabold bd-ink">What happens next</div>
                      {order.status === "PENDING" ? (
                        <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                          <li><b>Pay now</b> to continue. This order is binding.</li>
                          <li>After you submit "I've paid", the seller will verify they received payment.</li>
                          <li>Once verified, arrange pickup/shipping in <Link className="bd-link font-semibold" href="/messages">Messages</Link>.</li>
                        </ul>
                      ) : order.status === "PAID" ? (
                        <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                          <li>Your payment is marked as <b>PAID</b>.</li>
                          <li>The seller will confirm receipt, then coordinate pickup/shipping in <Link className="bd-link font-semibold" href="/messages">Messages</Link>.</li>
                          <li>After the handover, leave feedback to help build trust.</li>
                        </ul>
                      ) : order.outcome === "COMPLETED" ? (
                        <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                          <li>This order is marked <b>COMPLETED</b>.</li>
                          <li>You can leave feedback anytime from this order.</li>
                        </ul>
                      ) : (
                        <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                          <li>Check the order status above for the current step.</li>
                          <li>Keep communication on Bidra in <Link className="bd-link font-semibold" href="/messages">Messages</Link>.</li>
                        </ul>
                      )}
                    </div>
                  </Card>
                  
                  For timed offers, the seller decides whether to proceed. If an order exists (like this one), it is binding and payment is expected. Bidra records confirmations but does not process payments or guarantee outcomes.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
