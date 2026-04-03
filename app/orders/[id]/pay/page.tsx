export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import SafetyCallout from "../../../../components/safety-callout";
import OrderStatusTimeline from "../../../../components/order-status-timeline";

export default async function OrderPayPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/auth/login?next=/orders/" + params.id);

  const gate = await requireAdult(session);
  if (!gate.ok) redirect("/account/restrictions");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { listing: true },
  });

  if (!order) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-3xl">
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Order</h1>
            <p className="mt-2 text-sm bd-ink2">Order not found.</p>
            <div className="mt-5">
              <Link href="/orders" className="bd-btn bd-btn-ghost">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const isBuyer = order.buyerId === user.id;
  const isSeller = (order.listing as unknown as { sellerId?: string } | null | undefined)?.sellerId === user.id;
  if (!isBuyer && !isSeller) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-3xl">
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Order</h1>
            <p className="mt-2 text-sm bd-ink2">You do not have access to this order.</p>
            <div className="mt-5">
              <Link href="/orders" className="bd-btn bd-btn-ghost">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const orderHref = "/orders/" + order.id;
  const listingHref = "/listings/" + order.listingId;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-3xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Order</h1>
              <div className="mt-2 text-sm bd-ink2">
                Payment confirmation is not part of Bidra V2. Follow the order status and the in-app pickup scheduling flow.
              </div>
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

          <SafetyCallout title="Bidra V2 flow">
            <ul className="list-disc pl-5">
              <li>Buy Now creates a binding order.</li>
              <li>Pickup scheduling happens in-app and controls the next step.</li>
              <li>Messages are for clarification only and do not override the scheduled flow.</li>
            </ul>
          </SafetyCallout>

          <Card className="bd-card p-6">
            <div className="grid gap-3">
              <div className="text-lg font-extrabold">{order.listing?.title ?? "Listing"}</div>
              <div className="text-sm bd-ink2">Amount: <b>${(order.amount / 100).toFixed(2)}</b> AUD</div>
              <OrderStatusTimeline status={order.status} outcome={order.outcome} className="mt-3" />
              <div className="text-sm bd-ink2">
                No separate payment confirmation page is required in V2. Return to the order and complete the pickup flow shown there.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
