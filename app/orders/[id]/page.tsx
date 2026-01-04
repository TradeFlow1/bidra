export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Button, Badge } from "@/components/ui";
import { getBaseUrl } from "@/lib/base-url";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect(`/auth/login?next=/orders/${params.id}`);

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
  if (order.buyerId !== user.id) {
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
                <span className="ml-2">Created {new Date(order.createdAt).toLocaleString("en-AU")}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/orders" className="bd-btn bd-btn-primary text-center">Orders</Link>
              <Link href={listingHref} className="bd-btn bd-btn-primary text-center">View listing</Link>
              <Link href={feedbackHref} className="bd-btn bd-btn-primary text-center">Leave feedback</Link>
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

              {order.status === "PENDING" ? (
                <div className="pt-2">
                  <form action={async (formData: FormData) => {
                    "use server";
                    const { auth } = await import("@/lib/auth");
                    const { prisma } = await import("@/lib/prisma");
                    const { stripe } = await import("@/lib/stripe");
                    const { redirect } = await import("next/navigation");
                    const { getBaseUrl } = await import("@/lib/base-url");

                    const session = await auth();
                    const user = session?.user as any;
                    if (!user) redirect("/auth/login");

                    const orderId = String(formData.get("orderId") ?? "");
                    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { listing: true } });
                    if (!order || order.buyerId !== user.id) throw new Error("Not allowed");
                    if (order.status !== "PENDING") redirect("/orders");

                    const baseUrl = getBaseUrl();
                    const sessionStripe = await stripe.checkout.sessions.create({
                      mode: "payment",
                      success_url: `${baseUrl}/orders?paid=1`,
                      cancel_url: `${baseUrl}/orders?cancelled=1`,
                      line_items: [
                        {
                          quantity: 1,
                          price_data: {
                            currency: "aud",
                            product_data: {
                              name: order.listing.title,
                              description: "Bidra marketplace purchase"
                            },
                            unit_amount: order.amount
                          }
                        }
                      ],
                      metadata: { orderId: order.id }
                    });

                    await prisma.order.update({
                      where: { id: order.id },
                      data: { stripeSessionId: sessionStripe.id }
                    });

                    redirect(sessionStripe.url || "/orders");
                  }}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <Button type="submit" className="bd-btn bd-btn-primary text-center">Pay now</Button>
                  </form>
                </div>
              ) : null}

              <div className="pt-2">
                <p className="text-xs bd-ink2">
                  Bidra does not decide a “winner” or force a sale — outcomes are seller-controlled. Payments shown here apply only if your order is marked payable.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
