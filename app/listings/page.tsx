export const dynamic = "force-dynamic";
export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FULL_CATEGORIES } from "@/lib/categories";
import WatchButton from "@/components/watch-button";

type SearchParams = {
  q?: string;
  category?: string;
  type?: string;
  condition?: string;
  location?: string;
  min?: string;
  max?: string;
  sort?: string;
};

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

function firstImage(images: string[] | null | undefined) {
  if (!images || !images.length) return null;
  const u = (images[0] ?? "").trim();
  return u.length ? u : null;
}

function endsLabel(endsAt: Date | null | undefined) {
  if (!endsAt) return null;
  const ms = endsAt.getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  if (ms <= 0) return "Ended";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `Ends in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `Ends in ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Ends in ${days}d`;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const q = cleanStr(searchParams?.q);
  const category = cleanStr(searchParams?.category);
  const type = cleanStr(searchParams?.type);
  const condition = cleanStr(searchParams?.condition);
  const location = cleanStr(searchParams?.location);
  const sort = cleanStr(searchParams?.sort);

  const minCents = parseMoneyToCents(searchParams?.min);
  const maxCents = parseMoneyToCents(searchParams?.max);

  const moneyErr = Number.isNaN(minCents as any) || Number.isNaN(maxCents as any);

  const where: any = { AND: [] as any[] };

  // Always hide DELETED/SUSPENDED/etc from public browse
  where.AND.push({ status: "ACTIVE" });

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
  if (condition) where.AND.push({ condition });

  if (location) {
    where.AND.push({
      location: { contains: location, mode: "insensitive" },
    });
  }

  if (!moneyErr) {
    if (typeof minCents === "number") where.AND.push({ price: { gte: minCents } });
    if (typeof maxCents === "number") where.AND.push({ price: { lte: maxCents } });
  }

  const finalWhere = where.AND.length ? where : undefined;

  const orderBy: any =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : sort === "ending_soon"
      ? { endsAt: "asc" }
      : { createdAt: "desc" };

  const listings = await prisma.listing.findMany({
    where: finalWhere,
    orderBy,
    take: 50,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      location: true,
      type: true,
      condition: true,
      price: true,
      buyNowPrice: true,
      reservePrice: true,
      endsAt: true,
      createdAt: true,
      images: true,
      bids: {
        orderBy: { amount: "desc" },
        take: 1,
        select: { amount: true },
      },
      _count: {
        select: { bids: true },
      },
    },
  });

  // Watch status (single query)
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
    condition ||
    location ||
    (searchParams?.min ?? "").trim() ||
    (searchParams?.max ?? "").trim() ||
    sort
  );

  const inputStyle: React.CSSProperties = {
    padding: "12px 12px",
    border: "1px solid rgba(0,0,0,0.15)",
    borderRadius: 12,
    fontSize: 14,
    width: "100%",
    minHeight: 44,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 900,
    marginBottom: 6,
  };

  return (
    <main>
      <div className="container">
        <section className="section" style={{ paddingTop: 18, paddingBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 className="h1" style={{ fontSize: 28 }}>Browse</h1>
              <p className="p" style={{ marginTop: 6 }}>
                {hasAnyFilter ? <>Showing results ({listings.length})</> : <>Showing latest listings ({listings.length})</>}
              </p>
            </div>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <form action="/listings" method="get" className="browseFilters">
              <div className="browseFiltersRow">
                <div>
                  <div style={labelStyle}>Search</div>
                  <input name="q" defaultValue={q} placeholder="Search listings" style={inputStyle} />
                </div>

                <div>
                  <div style={labelStyle}>Category</div>
                  <select name="category" defaultValue={category} style={inputStyle}>
                    <option value="">All categories</option>
                    {FULL_CATEGORIES.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={labelStyle}>Type</div>
                  <select name="type" defaultValue={type} style={inputStyle}>
                    <option value="">Any</option>
<option value="BUY_NOW">Buy now</option>
                    <option value="FIXED_PRICE">Fixed price</option>
                  </select>
                </div>

                <div>
                  <div style={labelStyle}>Condition</div>
                  <select name="condition" defaultValue={condition} style={inputStyle}>
                    <option value="">Any</option>
                    <option value="New">New</option>
                    <option value="Used - Like New">Used - Like New</option>
                    <option value="Used - Good">Used - Good</option>
                    <option value="Used - Fair">Used - Fair</option>
                  </select>
                </div>

                <div>
                  <div style={labelStyle}>Sort</div>
                  <select name="sort" defaultValue={sort} style={inputStyle}>
                    <option value="">Newest</option>
                    <option value="ending_soon">Ending soon</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                  </select>
                </div>
              </div>

              <div className="browseFiltersRow">
                <div>
                  <div style={labelStyle}>Location</div>
                  <input name="location" defaultValue={location} placeholder="Location" style={inputStyle} />
                </div>

                <div>
                  <div style={labelStyle}>Min ($)</div>
                  <input
                    name="min"
                    defaultValue={(searchParams?.min ?? "").trim()}
                    placeholder="Min"
                    style={inputStyle}
                    inputMode="decimal"
                  />
                </div>

                <div>
                  <div style={labelStyle}>Max ($)</div>
                  <input
                    name="max"
                    defaultValue={(searchParams?.max ?? "").trim()}
                    placeholder="Max"
                    style={inputStyle}
                    inputMode="decimal"
                  />
                </div>
              </div>

              {moneyErr ? (
                <div style={{ color: "#b91c1c", fontWeight: 900, fontSize: 13 }}>
                  Price filters must be numbers (example: 10 or 10.50).
                </div>
              ) : null}

              <div className="btnRow" style={{ marginTop: 6 }}>
                <button type="submit" className="btnPrimary" style={{ cursor: "pointer" }}>
                  Apply
                </button>
                {hasAnyFilter ? (
                  <Link href="/listings" className="btnSecondary">Clear</Link>
                ) : null}
              </div>
            </form>
          </div>

          <div className="browseList">
            {listings.length === 0 ? (
              <div className="card" style={{ opacity: 0.9 }}>
                <p className="cardBody" style={{ margin: 0 }}>No listings found.</p>
              </div>
            ) : (
              listings.map((l) => {
                const href = `/listings/${l.id}`;
                const topBid = l.bids && l.bids.length ? l.bids[0].amount : null;

                const current =
                  l.type === "AUCTION"
                    ? (topBid ?? l.price)
                    : (l.buyNowPrice ?? l.price);

                const reserveMet =
                  l.type !== "AUCTION"
                    ? null
                    : l.reservePrice === null || l.reservePrice === undefined
                      ? true
                      : current >= l.reservePrice;

                const img = firstImage(l.images);
                const priceLabel = l.type === "AUCTION" ? "Top offer" : "Price";
                const ends = l.type === "AUCTION" ? endsLabel(l.endsAt) : null;

                return (
                  <div key={l.id} className="card cardTap">
                    <Link href={href} className="stretchedLink" aria-label={`Open ${l.title || "listing"}`} />
                    <div className="cardTapContent">
                      <div className="browseItem">
                        <div className="browseThumb">
                          {img ? (
                            <img
                              src={img}
                              alt={l.title || "Listing"}
                             
                             
                              style={{ objectFit: "cover" }} />
                          ) : (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: 900,
                                color: "rgba(15,17,21,0.45)",
                              }}
                            >
                              No photo
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="browseTitle">{l.title}</div>

                          <div className="browseMeta">
                            {l.category ? <span>{l.category}</span> : null}
                            {l.category && l.location ? <span> • </span> : null}
                            {l.location ? <span>{l.location}</span> : null}
                          </div>

                          <div className="browseBadges">
                            {l.type === "AUCTION" ? (
                              <>
                                <span className="browseBadge badgeTimed">Offers</span>
                                <div className={`reserveLine ${reserveMet ? "reserveMet" : "reserveNotMet"}`}>
                                  <span className="reserveDot"></span>
                                  <span>"Offers • Seller accepts an offer"</span>
                                </div>
                              </>
                            ) : l.type === "BUY_NOW" ? (
                              <span className="browseBadge badgeBuyNow">Buy now</span>
                            ) : (
                              <span className="browseBadge badgeFixed">Fixed price</span>
                            )}
                          </div>

                          {l.type === "AUCTION" ? (
                            <div className="reserveHint">
                              Seller minimum price
                            </div>
                          ) : null}

                          <div className="browsePriceRow">
                            <div style={{ display: "grid", gap: 2 }}>
                              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                                {priceLabel}
                                {l.type === "AUCTION" && typeof l._count?.bids === "number" ? (
                                  <span style={{ marginLeft: 10 }}>
                                    {l._count.bids} offer{l._count.bids === 1 ? "" : "s"}
                                  </span>
                                ) : null}
                              </div>

                              <div className="browsePrice">${dollars(current)}</div>

                              {l.type === "AUCTION" && ends ? (
                                <div style={{ color: "var(--muted)", fontSize: 12 }}>
                                  {ends}
                                </div>
                              ) : null}

                              {l.type === "AUCTION" && typeof l.buyNowPrice === "number" && current < l.buyNowPrice ? (
                                <div style={{ color: "var(--muted)", fontSize: 12 }}>
                                  Buy now ${dollars(l.buyNowPrice)}
                                </div>
                              ) : null}
                            </div>

                            <div style={{ position: "relative", zIndex: 5 }}>
                              <div className="tapExclude"><WatchButton listingId={l.id} initialWatched={watchedSet.has(l.id)} compact  /></div>
                            </div>
                          </div>

                          {l.description ? (
                            <p className="cardBody" style={{ marginTop: 10, marginBottom: 0 }}>
                              {l.description.length > 140 ? l.description.slice(0, 140) + "…" : l.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
