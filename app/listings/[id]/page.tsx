import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { seller: true },
  });

  if (!listing) {
    return (
      <main>
        <h1 className="text-xl font-semibold">Listing not found</h1>
        <Link href="/listings" className="mt-4 inline-block underline">
          Back to listings
        </Link>
      </main>
    );
  }

  return (
    <main>
      <Link
        href="/listings"
        className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 opacity-80"
      >
        ← Back to listings
      </Link>

      <div className="mt-6 flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">{listing.title}</h1>
          <div className="mt-2 text-sm opacity-80">
            Listed by <span className="font-medium">{listing.seller?.name || "Unknown seller"}</span>
          </div>
        </header>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="text-3xl font-black">
              ${Number(listing.price / 100).toFixed(2)}
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2 md:gap-x-8">
              <div><span className="font-semibold">Category:</span> {listing.category}</div>
              <div><span className="font-semibold">Condition:</span> {listing.condition}</div>
              <div><span className="font-semibold">Location:</span> {listing.location}</div>
              <div><span className="font-semibold">Type:</span> {String(listing.type)}</div>
              <div><span className="font-semibold">Status:</span> {String(listing.status)}</div>
            </div>
          </div>
        </section>

        {Array.isArray(listing.images) && listing.images.length > 0 && (
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Photos</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {listing.images.slice(0, 4).map((src: any, idx: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={idx}
                  src={String(src)}
                  alt={`${listing.title} photo ${idx + 1}`}
                  className="w-full rounded-xl border object-cover"
                />
              ))}
            </div>
          </section>
        )}

          <p className="mt-3 whitespace-pre-line text-sm leading-6">
            {listing.description}
          </p>
        </section>

        <div>
          <Link
            href="/sell/new"
            className="inline-flex rounded-xl bg-black px-5 py-3 text-white shadow-sm hover:opacity-90"
          >
            Create another listing
          </Link>
        </div>
      </div>
    </main>
  );
}


