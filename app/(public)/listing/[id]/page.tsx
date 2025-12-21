import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Button, Badge } from "@/components/ui";

function minIncrementCents(current: number) {
  if (current < 2000) return 100;       // <$20 => $1
  if (current < 10000) return 250;      // <$100 => $2.50
  if (current < 50000) return 500;      // <$500 => $5
  if (current < 200000) return 1000;    // <$2000 => $10
  return 2500;                          // >=$2000 => $25
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as any;

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { seller: true }
  });

  if (!listing) redirect("/listings");

  const bids = await prisma.bid.findMany({
    where: { listingId: listing.id },
    orderBy: { amount: "desc" },
    take: 10
  });

  const topBid = bids[0]?.amount ?? 0;
  const inc = minIncrementCents(Math.max(topBid, listing.price));
  const nextMinBid = Math.max(topBid + inc, listing.price);

  const watched = user
    ? await prisma.watchlist.findFirst({ where: { userId: user.id, listingId: listing.id } })
    : null;

  async function toggleWatch() {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const u = s?.user as any;
    if (!u) redirect("/auth/login");

    const exists = await prisma.watchlist.findFirst({ where: { userId: u.id, listingId: "${listing.id}" } });
    if (exists) {
      await prisma.watchlist.delete({ where: { id: exists.id } });
    } else {
      await prisma.watchlist.create({ data: { userId: u.id, listingId: "${listing.id}" } });
    }

    redirect("/listing/${listing.id}");
  }

  async function buyNow() {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { stripe } = await import("@/lib/stripe");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const u = s?.user as any;
    if (!u) redirect("/auth/login");

    const l = await prisma.listing.findUnique({ where: { id: "${listing.id}" } });
    if (!l || l.status !== "ACTIVE" || l.type !== "BUY_NOW") throw new Error("Unavailable");
    if (l.sellerId === u.id) throw new Error("Cannot buy your own listing");

    const order = await prisma.order.create({
      data: {
        buyerId: u.id,
        listingId: l.id,
        amount: l.price,
        status: "PENDING"
      }
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const sessionStripe = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${baseUrl}/orders?paid=1`,
      cancel_url: `${baseUrl}/listing/${l.id}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "aud",
            product_data: { name: l.title, description: "Bidra marketplace purchase" },
            unit_amount: l.price
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
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm text-neutral-600">{listing.category} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ {listing.location}</div>
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <div className="mt-2 flex gap-2 flex-wrap">
            <Badge>{listing.type === "AUCTION" ? "Auction" : "Buy now"}</Badge>
            <Badge>{listing.condition}</Badge>
            <Badge>Status: {listing.status}</Badge>
          </div>
          {listing.type === "AUCTION" && listing.endsAt ? (
            <div className="mt-2 text-sm text-neutral-700">
              Ends: <b>{new Date(listing.endsAt).toLocaleString("en-AU")}</b>
            </div>
          ) : null}
        </div>

        <div className="flex gap-2">
          {user ? (
            <form action={toggleWatch}>
              <Button type="submit">{watched ? "Unwatch" : "Watch"}</Button>
            </form>
          ) : (
            <Link href="/auth/login" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">Log in to watch</Link>
          )}
          <Link href={"/seller/" + listing.sellerId} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">
            Seller
          </Link>
          {user ? (
            <Link href={"/messages/" + listing.id} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">
              Message
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <h2 className="font-semibold">Description</h2>
          <p className="mt-2 text-sm text-neutral-700 whitespace-pre-wrap">{listing.description}</p>
          {listing.images?.length ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {listing.images.map((src) => (
                <div key={src} className="rounded-md border bg-neutral-50 p-2 text-xs text-neutral-600">
                  Image: {src}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 text-xs text-neutral-600">No photos yet (MVP).</div>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold">Price</h2>
          <div className="mt-2 text-2xl font-bold">${(listing.price/100).toFixed(2)} AUD</div>

          {listing.type === "BUY_NOW" ? (
            <div className="mt-4">
              {listing.status !== "ACTIVE" ? (
                <div className="text-sm text-neutral-600">This listing is not available.</div>
              ) : (
                <form action={buyNow}>
                  <Button type="submit" className="w-full bg-black text-white border-black hover:opacity-90">Buy now</Button>
                </form>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <div className="text-sm text-neutral-700">
                Highest bid: <b>${(topBid/100).toFixed(2)}</b>
              </div>
              <div className="text-xs text-neutral-600 mt-1">
                Minimum increment: ${(inc/100).toFixed(2)} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Next minimum bid: ${(nextMinBid/100).toFixed(2)}
              </div>
              <div className="mt-3">
                <Link href={"/api/bids/place?listingId=" + listing.id} className="text-sm underline">
                  Place bid (use form on bids endpoint page)
                </Link>
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-neutral-600">
            Always follow safety tips and avoid sharing sensitive information.
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold">Recent bids</h2>
        <div className="mt-2 text-sm text-neutral-700">
          {bids.length ? (
            <ul className="list-disc pl-5">
              {bids.map(b => (
                <li key={b.id}>${(b.amount/100).toFixed(2)} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ {new Date(b.createdAt).toLocaleString("en-AU")}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-neutral-600">No bids yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
