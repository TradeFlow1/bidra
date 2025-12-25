import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ListingsIndexPage() {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" as any },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      category: true,
      condition: true,
      location: true,
      price: true,
      createdAt: true,
    },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Listings</h1>
          <p className="mt-1 text-sm opacity-80">Latest active items.</p>
        </div>

        <Link
          href="/sell/new"
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          Create listing
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {listings.length === 0 ? (
          <div className="rounded-md border p-4 text-sm opacity-80">
            No listings yet.
          </div>
        ) : (
          listings.map((l) => (
            <Link
              key={l.id}
              href={`/listings/${l.id}`}
              className="rounded-md border p-4 hover:bg-black/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{l.title}</div>
                  <div className="mt-1 text-sm opacity-80">
                    {l.category} • {l.condition} • {l.location}
                  </div>
                </div>

                <div className="text-sm font-semibold">
                  ${Number(l.price / 100).toFixed(2)}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
