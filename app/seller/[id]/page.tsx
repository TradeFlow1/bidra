import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";

export default async function SellerPage({ params }: { params: { id: string } }) {
  const seller = await prisma.user.findUnique({ where: { id: params.id } });
  if (!seller) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold">Seller not found</h1>
        <Link className="mt-4 inline-block rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50" href="/listings">
          Browse
        </Link>
      </div>
    );
  }

  const listings = await prisma.listing.findMany({
    where: { sellerId: seller.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  // Simple ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œseller ratingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â placeholder: ratio of sold/ended orders in future iterations.
  const totalListings = await prisma.listing.count({ where: { sellerId: seller.id } });
  const activeCount = await prisma.listing.count({ where: { sellerId: seller.id, status: "ACTIVE" } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-sm text-neutral-600">Seller</div>
        <h1 className="text-2xl font-bold">{seller.name ?? seller.email}</h1>
        <div className="mt-2 flex gap-2 flex-wrap">
          {seller.location ? <Badge>{seller.location}</Badge> : null}
          <Badge>{activeCount} active</Badge>
          <Badge>{totalListings} total listings</Badge>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((l: any) => (
          <Link key={l.id} href={"/listings/" + l.id}>
            <Card className="hover:shadow-md">
              <div className="text-sm text-neutral-600">{l.category} • {l.location}</div>
              <div className="mt-1 font-semibold">{l.title}</div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Badge>{l.type === "AUCTION" ? "Auction" : "Buy now"}</Badge>
                <Badge>{l.condition}</Badge>
              </div>
              <div className="mt-3 text-sm font-bold">${(l.price/100).toFixed(2)} AUD</div>
            </Card>
          </Link>
        ))}
      </div>

      {!listings.length ? <div className="text-sm text-neutral-600">No active listings from this seller right now.</div> : null}
    </div>
  );
}
