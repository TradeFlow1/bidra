import { notFound } from "next/navigation";
import Link from "next/link";
import TrustPanel from "@/components/trust/trust-panel";
import ListingCard from "@/components/listing-card";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: { id: string };
}

function formatLocation(suburb: string | null | undefined, state: string | null | undefined) {
  const parts = [String(suburb || "").trim(), String(state || "").trim()].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location not provided";
}

export default async function SellerPage({ params }: PageProps) {
  const sellerId = params.id;

  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      username: true,
      suburb: true,
      state: true,
      createdAt: true,
      _count: {
        select: {
          listings: { where: { status: "ACTIVE" } },
        },
      },
    },
  });

  if (!seller) notFound();

  const soldCount = await prisma.listing.count({
    where: { sellerId, status: "SOLD" },
  });

  const listings = await prisma.listing.findMany({
    where: { sellerId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      buyNowPrice: true,
      type: true,
      category: true,
      condition: true,
      location: true,
      images: true,
      status: true,
    },
  });

  const sellerName = seller.username || "Seller";
  const sellerLocation = formatLocation(seller.suburb, seller.state);

  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Seller profile</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">{sellerName}</h1>
              <p className="mt-2 text-sm text-neutral-600 sm:text-base">
                View seller trust signals, location context, and active marketplace listings.
              </p>
              <div className="mt-3 inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-sm font-semibold text-neutral-700 shadow-sm">
                {sellerLocation}
              </div>
            </div>

            <div className="grid min-w-[220px] gap-3 sm:grid-cols-2 md:min-w-[320px]">
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Active listings</div>
                <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{seller._count.listings}</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Sold</div>
                <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{soldCount}</div>
              </div>
            </div>
          </div>
        </div>

        <TrustPanel
          username={seller.username}
          suburb={seller.suburb}
          state={seller.state}
          joinedAt={seller.createdAt}
          activeCount={seller._count.listings}
          soldCount={soldCount}
        />

        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-neutral-950">Active listings</div>
              <div className="mt-1 text-sm text-neutral-600">
                Browse what this seller currently has available on Bidra.
              </div>
            </div>

            <Link href="/listings" className="bd-btn bd-btn-ghost text-center">
              Browse marketplace
            </Link>
          </div>

          <div className="mt-5">
            {listings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/15 bg-neutral-50 px-6 py-10 text-center">
                <div className="mx-auto max-w-xl">
                  <div className="text-lg font-bold text-neutral-900">No active listings right now</div>
                  <p className="mt-2 text-sm text-neutral-600">
                    This seller does not currently have any active marketplace listings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {listings.map((l) => (
                  <ListingCard
                    key={l.id}
                    listing={{
                      id: l.id,
                      title: l.title,
                      description: l.description ?? null,
                      price: l.price,
                      buyNowPrice: l.buyNowPrice ?? null,
                      type: l.type ?? undefined,
                      category: l.category ?? undefined,
                      condition: l.condition ?? undefined,
                      location: l.location ?? undefined,
                      images: l.images ?? undefined,
                      status: l.status ?? "ACTIVE",
                      seller: {
                        name: seller.username || "Seller",
                        memberSince: seller.createdAt,
                        location: sellerLocation,
                      },
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
