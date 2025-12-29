import { notFound } from "next/navigation";
import Link from "next/link";
import TrustPanel from "@/components/trust/trust-panel";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: { id: string };
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
    select: { id: true, title: true, price: true },
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>
        {seller.username}
      </h1>

      <TrustPanel
        username={seller.username}
        suburb={seller.suburb}
        state={seller.state}
        joinedAt={seller.createdAt}
        activeCount={seller._count.listings}
        soldCount={soldCount}
      />

      <div style={{ marginTop: 18, fontWeight: 900 }}>Active listings</div>

      <div
        style={{
          marginTop: 10,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {listings.map((l) => (
          <Link
            key={l.id}
            href={`/listings/${l.id}`}
            style={{
              display: "block",
              padding: 12,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              textDecoration: "none",
              color: "inherit",
              background: "white",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 4 }}>{l.title}</div>
            {l.price !== null && (
              <div style={{ fontWeight: 700 }}>
                ${Number(l.price).toLocaleString()}
              </div>
            )}
          </Link>
        ))}

        {listings.length === 0 && (
          <div style={{ opacity: 0.6 }}>
            This seller has no active listings.
          </div>
        )}
      </div>
    </div>
  );
}
