import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@/lib/base-url";
import { Card, Button, Badge } from "@/components/ui";

export default async function OrdersPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    include: { listing: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="bd-container py-10"><div className="container max-w-4xl">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
          <Link href="/listings" className="bd-btn bd-btn-primary text-center">Browse</Link>
        </div>

        <div className="grid gap-3">
          {orders.map((o: any) => (
            <Card key={o.id} className="bd-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="text-sm bd-ink2">
                  <Badge>{o.status}</Badge>{" "}
                  <span className="ml-2">Created {new Date(o.createdAt).toLocaleString("en-AU")}</span>
                </div>
                <div className="mt-1 font-semibold">
                  <Link className="bd-ink font-extrabold hover:underline underline-offset-4" href={`/listings/${o.listingId}`}>{o.listing.title}</Link>
                </div>
                <div className="text-sm bd-ink2 mt-1">
                  Amount: <b>${(o.amount/100).toFixed(2)}</b> AUD
                </div>
              </div>

              <div className="flex gap-2">
                {o.status === "PENDING" ? (
                  <form action={async (formData: FormData) => {
                    "use server";
                    const { auth } = await import("@/lib/auth");
                    const { prisma } = await import("@/lib/prisma");
                    const { stripe } = await import("@/lib/stripe");
                    const { redirect } = await import("next/navigation");

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
                    <input type="hidden" name="orderId" value={o.id} />
                    <Button type="submit" className="bd-btn bd-btn-primary text-center">Pay now</Button>
                  </form>
                ) : null}

                <Link href={`/listings/${o.listingId}`} className="bd-btn bd-btn-primary text-center">
                  View listing
                </Link>
              </div>
            </Card>
          ))}
          {!orders.length ? <div className="text-sm bd-ink2">No orders yet.</div> : null}
        </div>
      </div>
    </div></main>
  );
}
