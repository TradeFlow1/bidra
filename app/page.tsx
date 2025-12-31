import Image from "next/image";
import Link from "next/link";
import HomeCategorySelect from "../components/home-category-select";

export const dynamic = "force-dynamic";

type Listing = {
  id: string;
  title: string;
  price?: number | null;
  currentPrice?: number | null;
  buyNowPrice?: number | null;
  isAuction?: boolean | null;
  reserveMet?: boolean | null;
  endsAt?: string | null;
  images?: string[] | null;
  createdAt?: string | null;
};

function formatMoney(n?: number | null) {
  if (n === null || n === undefined) return "";
  try {
    return n.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
  } catch {
    return "$" + n;
  }
}

function safeFirstImage(listing: Listing) {
  const first = listing.images && listing.images.length ? listing.images[0] : null;
  return first || "/brand/placeholder.png";
}

async function getLatestListings(): Promise<Listing[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/listings`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data as Listing[];
    if (data && Array.isArray(data.items)) return data.items as Listing[];
    return [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const listings = await getLatestListings();
  const latest = listings.slice(0, 12);

  return (
    <main>
      <div className="container">
        <section className="section" style={{ paddingTop: 22 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ minWidth: 240, flex: "1 1 380px" }}>
                <div style={{ width: 200, maxWidth: "70vw", marginBottom: 10 }}>
                  <Image
                    src="/brand/logo/bidra-logo_light.png"
                    alt="Bidra"
                    width={1200}
                    height={400}
                    priority
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>

                <h1 className="h1" style={{ marginBottom: 8 }}>
                  Buy and sell with clear intent.
                </h1>

                <p className="p" style={{ marginTop: 0 }}>
                  Browse listings, make real offers, and complete trades without the noise.
                </p>

                <div className="btnRow" style={{ marginTop: 14 }}>
                  <Link href="/listings" className="btnPrimary">Browse</Link>
                  <Link href="/sell" className="btnSecondary">Sell</Link>
                  <Link href="/account" className="btnSecondary">My account</Link>
                </div>
              </div>

              <div style={{ flex: "0 1 360px", width: "100%" }}>
                <div className="card homeQuickStart" style={{ background: "rgba(11,14,17,0.03)" }}>
                  <div className="cardTitle" style={{ marginBottom: 8 }}>Quick start</div>
                  <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                    <li>Choose a category to narrow your browse.</li>
                    <li>Open a listing to see price, offers, and timing.</li>
                    <li>Use your dashboard to manage your listings and orders.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 20, letterSpacing: "-0.01em" }}>Categories</h2>
            <Link href="/categories" style={{ color: "var(--muted)", fontSize: 14 }}>
              View all
            </Link>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <HomeCategorySelect />
          </div>
        </section>

        <section className="section" style={{ paddingTop: 10, paddingBottom: 70 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 20, letterSpacing: "-0.01em" }}>Latest listings</h2>
            <Link href="/listings" style={{ color: "var(--muted)", fontSize: 14 }}>
              Browse all
            </Link>
          </div>

          {latest.length === 0 ? (
            <div className="card" style={{ marginTop: 12 }}>
              <p className="cardBody" style={{ margin: 0 }}>
                No listings to show yet. Check back soon, or be the first to list an item.
              </p>
              <div className="btnRow" style={{ marginTop: 12 }}>
                <Link href="/sell" className="btnPrimary">Create a listing</Link>
                <Link href="/listings" className="btnSecondary">Browse</Link>
              </div>
            </div>
          ) : (
            <div className="grid3" style={{ marginTop: 12 }}>
              {latest.map((l) => {
                const img = safeFirstImage(l);
                const price = l.isAuction ? (l.currentPrice ?? l.price) : (l.buyNowPrice ?? l.price);
                const priceLabel = l.isAuction ? "Top offer" : "Price";

                return (
                  <Link key={l.id} href={`/listings/${l.id}`} className="card" style={{ textDecoration: "none" }}>
                    <div style={{ width: "100%", aspectRatio: "4 / 3", position: "relative", borderRadius: 12, overflow: "hidden", background: "rgba(11,14,17,0.06)" }}>
                      <Image
                        src={img}
                        alt={l.title || "Listing"}
                        fill
                        sizes="(max-width: 900px) 100vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <div className="cardTitle" style={{ marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {l.title || "Untitled"}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                        <div style={{ fontSize: 14, color: "var(--muted)" }}>{priceLabel}</div>
                        <div style={{ fontWeight: 800 }}>{formatMoney(price)}</div>
                      </div>

                      {l.isAuction ? (
                        <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
                          Offers • Seller accepts an offer
                        </div>
                      ) : (
                        <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
                          Buy now
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
