import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";
import SellerConfirmReceived from "./[id]/seller-confirm-received";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/auth/login");

  const gate = await requireAdult(session);
  if (!gate.ok) redirect("/account/restrictions");

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { buyerId: user.id },
        { listing: { sellerId: user.id } },
      ],
    },
    include: { listing: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="bd-container py-10">
      <div className="container max-w-4xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
            <Link href="/listings" className="bd-btn bd-btn-primary text-center">
              Browse
            </Link>
          </div>

          <div className="grid gap-3">
            {orders.map((o: any) => (
              <Card
                key={o.id}
                className="bd-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm bd-ink2">
                    <Badge>{o.outcome === "COMPLETED" ? "COMPLETED" : o.status}</Badge>{" "}
                    <span className="ml-2">
                      Created <DateTimeText value={o.createdAt} />
                    </span>
                  </div>

                  <div className="mt-1 font-semibold">
                    <Link
                      className="bd-ink font-extrabold hover:underline underline-offset-4"
                      href={`/listings/${o.listingId}`}
                    >
                      {o?.listing?.title ?? "Listing"}
                    </Link>
                  </div>

                  <div className="text-sm bd-ink2 mt-1">
                    Amount: <b>${(Number(o.amount) / 100).toFixed(2)}</b> AUD
                  </div>
                  <div className="text-xs bd-ink2 mt-1">
                    Order: <code className="font-mono">{String(o.id).slice(-6)}</code>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-end w-full md:w-auto">
                  {(o.status === "PICKUP_REQUIRED" && o.buyerId === user.id) ? (
                    <Link
                      href={`/orders/${o.id}/pay`}
                      className="bd-btn bd-btn-primary text-center py-3 w-full sm:w-auto sm:min-w-[220px] focus:outline-none focus:ring-2 focus:ring-black/20"
                    >
                      <span className="block">Confirm payment</span>
                      <span className="mt-1 block text-xs bd-ink2">Binding order — please pay to proceed.</span>
                    </Link>
                  ) : null}

                  

                  {(o.status === "PICKUP_SCHEDULED" && o.listing?.sellerId === user.id && o.outcome !== "COMPLETED") ? (

                    <SellerConfirmReceived orderId={o.id} />

                  ) : null}

<Link
  href={`/orders/${o.id}`}
  className="bd-btn bd-btn-primary text-center py-3 w-full sm:w-auto sm:min-w-[220px] whitespace-nowrap"
>
    <span className="block">View order</span>
    <span className="mt-1 block text-xs bd-ink2">Order ID · {String(o.id).slice(-6)}</span>
</Link>

                  <Link
                    href={`/listings/${o.listingId}`}
                     className="bd-btn bd-btn-ghost text-center w-full sm:w-auto"
                  >
                    View listing
                  </Link>

                  {(o.outcome === "COMPLETED" && ((o.buyerId === user.id && !o.buyerFeedbackAt) || (o.listing?.sellerId === user.id && !o.sellerFeedbackAt))) ? (
                    <Link
                      href={`/orders/${o.id}/feedback`}
                      className="bd-btn bd-btn-ghost text-center"
                    >
                      Leave feedback
                    </Link>
                  ) : null}
                </div>
              </Card>
            ))}

            {!orders.length ? (
              <div className="bd-card p-6">
  <div className="text-base font-semibold bd-ink">No orders yet.</div>
  <div className="mt-1 text-sm bd-ink2">
    When you buy now (binding) or a seller accepts your top offer, your order will appear here.
  </div>
  <div className="mt-4 flex flex-wrap gap-2">
    <Link href="/listings" className="bd-btn bd-btn-primary text-center">Browse listings</Link>
    <Link href="/sell/new" className="bd-btn bd-btn-ghost text-center">Create a listing</Link>
  </div>
</div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
