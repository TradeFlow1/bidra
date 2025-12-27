export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FULL_CATEGORIES } from "@/lib/categories";
import WatchButton from "@/components/watch-button";

function dollars(cents: number | null | undefined) {
  const v = typeof cents === "number" ? cents : 0;
  return (v / 100).toFixed(2);
}

function parseMoneyToCents(input: string | null | undefined) {
  const s = (input ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return Math.round(n * 100);
}

function cleanStr(v: string | null | undefined) {
  const s = (v ?? "").trim();
  return s.length ? s : "";
}

type SearchParams = {
  q?: string;
  category?: string;
  type?: string;
  location?: string;
  min?: string;
  max?: string;
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const q = cleanStr(searchParams?.q);
  const category = cleanStr(searchParams?.category);
  const type = cleanStr(searchParams?.type);
  const location = cleanStr(searchParams?.location);

  const minCents = parseMoneyToCents(searchParams?.min);
  const maxCents = parseMoneyToCents(searchParams?.max);

  const moneyErr =
    Number.isNaN(minCents as any) || Number.isNaN(maxCents as any);

  const where: any = { AND: [] as any[] };

  if (q) {
    where.AND.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (category) where.AND.push({ category });
  if (type) where.AND.push({ type });
  if (location)
    where.AND.push({
      location: { contains: location, mode: "insensitive" },
    });

  if (!moneyErr) {
    if (typeof minCents === "number") where.AND.push({ price: { gte: minCents } });
    if (typeof maxCents === "number") where.AND.push({ price: { lte: maxCents } });
  }

  const finalWhere = where.AND.length ? where : undefined;

  const listings = await prisma.listing.findMany({
    where: finalWhere,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      location: true,
      type: true,
      price: true,
      createdAt: true,
    },
  });

  //  Watch status in one query (no per-item fetch spam)
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const watchedSet = new Set<string>();
  if (userId && listings.length) {
    const watched = await prisma.watchlist.findMany({
      where: { userId, listingId: { in: listings.map((l) => l.id) } },
      select: { listingId: true },
    });
    watched.forEach((w) => watchedSet.add(w.listingId));
  }

  const hasAnyFilter = !!(
    q ||
    category ||
    type ||
    location ||
    (searchParams?.min ?? "").trim() ||
    (searchParams?.max ?? "").trim()
  );

  const inputStyle: React.CSSProperties = {
    padding: "10px 12px",
    border: "1px solid rgba(0,0,0,0.15)",
    borderRadius: 10,
    fontSize: 14,
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 6,
  };

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 16,
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Browse listings</h1>
          <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.75 }}>
            {hasAnyFilter ? (
              <>Showing results ({listings.length})</>
            ) : (
              <>Showing latest listings ({listings.length})</>
            )}
          </p>
        </div>
</header>

      <section
        style={{
          marginTop: 16,
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 14,
          padding: 14,
          background: "#fff",
        }}
      >
        <form action="/listings" method="get" style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "2fr 1fr 1fr" }}>
            <div>
              <div style={labelStyle}>Search</div>
              <input
                name="q"
                defaultValue={q}
                placeholder="Search listings (e.g. bike, iPhone, sofa)"
                style={inputStyle}
              />
            </div>

            <div>
              <div style={labelStyle}>Category</div>
              <select name="category" defaultValue={category} style={inputStyle}>
                <option value="">All categories</option>
                {FULL_CATEGORIES.map((c: string) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={labelStyle}>Type</div>
              <select name="type" defaultValue={type} style={inputStyle}>
                <option value="">Any type</option>
                <option value="AUCTION">Auction</option>
                <option value="FIXED_PRICE">Fixed price</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "2fr 1fr 1fr" }}>
            <div>
              <div style={labelStyle}>Location</div>
              <input
                name="location"
                defaultValue={location}
                placeholder="Location (e.g. Toowoomba)"
                style={inputStyle}
              />
            </div>

            <div>
              <div style={labelStyle}>Min price ($)</div>
              <input
                name="min"
                
                placeholder="Min"
                style={inputStyle}
              />
            </div>

            <div>
              <div style={labelStyle}>Max price ($)</div>
              <input
                name="max"
                
                placeholder="Max"
                style={inputStyle}
              />
            </div>
          </div>

          {moneyErr ? (
            <div style={{ color: "#b91c1c", fontWeight: 800, fontSize: 13 }}>
              Price filters must be numbers (example: 10 or 10.50).
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="submit"
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "#2563eb",
                color: "white",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Apply filters
            </button>

            {hasAnyFilter ? (
              <Link href="/listings" style={{ textDecoration: "underline", fontWeight: 800 }}>
                Clear all
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      <section style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {listings.length === 0 ? (
          <div style={{ marginTop: 12, opacity: 0.8 }}>No listings found.</div>
        ) : (
          listings.map((l) => (
            <div
              key={l.id}
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 14,
                padding: 14,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 260 }}>
                  <Link href={`/listings/${l.id}`} style={{ textDecoration: "underline", fontWeight: 900 }}>
                    {l.title}
                  </Link>

                  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
                    {l.category ? <span>{l.category}</span> : null}
                    {l.category && l.location ? <span> - </span> : null}
                    {l.location ? <span>{l.location}</span> : null}
                    {(l.category || l.location) && l.type ? <span> - </span> : null}
                    {l.type ? <span>{l.type}</span> : null}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 900 }}>${dollars(l.price)}</div>
                  <WatchButton listingId={l.id} initialWatched={watchedSet.has(l.id)} compact />
                </div>
              </div>

              {l.description ? (
                <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.9 }}>
                  {l.description.length > 220 ? l.description.slice(0, 220) + "..." : l.description}
                </p>
              ) : null}
            </div>
          ))
        )}
      </section>
    </main>
  );
}