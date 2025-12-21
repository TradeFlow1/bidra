import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Link href="/listings" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">Browse</Link>
      </div>

      <div className="grid gap-3">
        {orders.map(o => (
          <Card key={o.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="text-sm text-neutral-600">
                <Badge>{o.status}</Badge>{" "}
                <span className="ml-2">Created {new Date(o.createdAt).toLocaleString("en-AU")}</span>
              </div>
              <div className="mt-1 font-semibold">
                <Link className="hover:underline" href={`/listing/${o.listingId}`}>{o.listing.title}</Link>
              </div>
              <div className="text-sm text-neutral-700 mt-1">
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

                  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
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
                  <Button type="submit" className="bg-black text-white border-black hover:opacity-90">Pay now</Button>
                </form>
              ) : null}

              <Link href={`/listing/${o.listingId}`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">
                View listing
              </Link>
            </div>
          </Card>
        ))}
        {!orders.length ? <div className="text-sm text-neutral-600">No orders yet.</div> : null}
      </div>
    </div>
  );
}
