export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import PayConfirmClient from "./pay-confirm-client";

function money(cents: number) {
  return (cents / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

export default async function OrderPayPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect(`/auth/login?next=/orders/${params.id}/pay`);

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { listing: true },
  });

  if (!order) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-3xl">
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Pay</h1>
            <p className="mt-2 text-sm bd-ink2">Order not found.</p>
            <div className="mt-5">
              <Link className="bd-link font-semibold" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  // buyer OR seller can view, but only buyer can confirm payment
  const isBuyer = order.buyerId === user.id;
  const isSeller = (order.listing as any)?.sellerId === user.id;
  if (!isBuyer && !isSeller) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-3xl">
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Pay</h1>
            <p className="mt-2 text-sm bd-ink2">You do not have access to this order.</p>
            <div className="mt-5">
              <Link className="bd-link font-semibold" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const orderHref = `/orders/${order.id}`;
  const listingHref = `/listings/${order.listingId}`;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-3xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Pay now</h1>
              <div className="text-sm bd-ink2 mt-1">
                <Badge>{order.status}</Badge>{" "}
                <span className="ml-2">Order <code className="font-mono">{order.id}</code></span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={orderHref} className="bd-btn bd-btn-primary text-center">Back to order</Link>
              <Link href={listingHref} className="bd-btn bd-btn-primary text-center">View listing</Link>
            </div>
          </div>

          <Card className="bd-card p-6">
            <div className="grid gap-3">
              <div className="text-lg font-extrabold">{order.listing?.title ?? "Listing"}</div>

              <div className="text-sm bd-ink2">
                Amount due: <b>{money(order.amount)}</b>
              </div>

              <div className="mt-2 bd-card p-4">
                <div className="text-sm font-extrabold bd-ink">PayID (Osko)</div>
                <div className="mt-2 text-sm bd-ink2">
                  Send the exact amount via PayID/Osko using your banking app.
                </div>

                <div className="mt-3 grid gap-2 text-sm">
                  <div><span className="bd-ink2">PayID:</span> <b>support@bidra.com.au</b></div>
                  <div><span className="bd-ink2">Reference:</span> <b>{order.id}</b></div>
                  <div><span className="bd-ink2">Amount:</span> <b>{money(order.amount)}</b></div>
                </div>

                <div className="mt-3 text-xs bd-ink2">
                  Tip: include the reference exactly so your payment can be matched quickly.
                </div>
              </div>

              {order.status === "PAID" ? (
                <div className="mt-2 text-sm bd-ink2">
                  This order is marked as <b>PAID</b>.
                </div>
              ) : (
                <div className="mt-2 grid gap-2">
                  {isBuyer ? (
                    <PayConfirmClient orderId={order.id} />
                  ) : (
                    <div className="text-sm bd-ink2">
                      Waiting for the buyer to confirm payment.
                    </div>
                  )}
                  <div className="text-xs bd-ink2">
                    Bidra is a marketplace platform — sellers control outcomes. This confirmation records that the buyer has paid via PayID/Osko.
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
