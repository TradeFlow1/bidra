import Link from "next/link";

import ListingCard from "@/components/listing-card";
import Image from "next/image";
import { headers } from "next/headers";
import HomeCategorySelectClient from "@/components/home-category-select-client";

type ListingLite = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  buyNowPrice?: number | null;
  type?: "FIXED_PRICE" | "AUCTION" | "BUY_NOW" | string;
  category?: string | null;
  condition?: string | null;
  location?: string | null;
  images?: any;
};

function money(cents: number) {
  const dollars = cents / 100;
  return dollars.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

function getRequestBaseUrl() {
  const h = headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function getLatestListings(): Promise<ListingLite[]> {
  const base = getRequestBaseUrl();
  const res = await fetch(`${base}/api/listings`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { listings?: ListingLite[] };
  return Array.isArray(data?.listings) ? data.listings.slice(0, 12) : [];
}

const LOGO_SRC = "/brand/logo/bidra-logo_light.png";

const S = {
  page: { maxWidth: 980, margin: "0 auto", padding: "18px 16px 56px" } as const,

  hero: {
    border: "1px solid rgba(255,255,255,0.10)",
    background:
      "radial-gradient(1200px 420px at 15% 10%, rgba(59,130,246,0.22), rgba(0,0,0,0)), linear-gradient(180deg, rgba(8,14,26,0.92), rgba(8,14,26,0.72))",
    borderRadius: 22,
    padding: 22,
    boxShadow: "0 18px 50px rgba(0,0,0,0.32)",
  } as const,

  heroInner: { display: "flex", flexDirection: "column" as const, gap: 12 } as const,

  logoRow: { display: "flex", alignItems: "center", gap: 12 } as const,
  logoWrap: {
    display: "inline-flex",
    alignItems: "center",
    padding: 0,
    background: "transparent",
    border: "none",
} as const,

  eyebrow: { color: "rgba(255,255,255,0.72)", fontSize: 12, letterSpacing: 1.1 } as const,

  h1: { color: "#fff", fontSize: 32, lineHeight: 1.12, margin: "10px 0 0", fontWeight: 750, letterSpacing: "-0.01em" } as const,
  p: { color: "rgba(255,255,255,0.78)", fontSize: 15, lineHeight: 1.6, margin: "8px 0 0", maxWidth: 560 } as const,

  ctas: { display: "flex", flexWrap: "wrap" as const, gap: 10, marginTop: 14 } as const,
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 14px",
    borderRadius: 12,
    background: "#ffffff",
    color: "#0b1220",
    fontWeight: 800,
    fontSize: 14,
    textDecoration: "none",
    boxShadow: "0 10px 24px rgba(0,0,0,0.20)",
  } as const,
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    textDecoration: "none",
  } as const,

  fine: { color: "rgba(255,255,255,0.58)", fontSize: 12, marginTop: 10, lineHeight: 1.5 } as const,

  section: { marginTop: 18 } as const,
  sectionTitle: {
    letterSpacing: "-0.2px", color: "rgba(10,18,32,0.88)", fontSize: "22px", fontWeight: 800, margin: "18px 0 10px" } as const,

  card: {
    borderRadius: 18,
    border: "1px solid rgba(10,18,32,0.10)",
    background: "rgba(255,255,255,0.92)",
    padding: 14,
    boxShadow: "0 10px 26px rgba(0,0,0,0.08)",
  } as const,

  grid: { display: "grid", gridTemplateColumns: "1fr", gap: 10 } as const,

  listing: {
    display: "block",
    borderRadius: 16,
    border: "1px solid rgba(10,18,32,0.10)",
    background: "#fff",
    padding: 12,
    textDecoration: "none",
    color: "inherit",
  } as const,

  listingTitle: { color: "#0b1220", fontSize: 14, fontWeight: 800, margin: 0 } as const,
  listingMeta: { color: "rgba(11,18,32,0.65)", fontSize: 12, marginTop: 4 } as const,
  listingRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10, gap: 10 } as const,
  price: { color: "#0b1220", fontSize: 14, fontWeight: 900 } as const,
  badge: { color: "rgba(11,18,32,0.60)", fontSize: 12 } as const,
};
export default async function HomePage() {
  const listings = await getLatestListings();

  return (
    <main style={S.page}>
      <section style={S.hero}>
        <div style={S.heroInner}>
          <div style={S.logoRow}>
            <div style={S.logoWrap}>
              <img
                src={LOGO_SRC}
                alt="Bidra"
                width={480}
                height={140}
               
                style={{ height: 84, width: "auto", filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.45))" }} />
            </div>
          </div>

          <div style={S.eyebrow}>AUSTRALIA-WIDE • LIST • BID • SELL</div>

          <h1 style={S.h1}>A marketplace built for real buyers.</h1>
          <p style={S.p}>
            Browse listings, place bids with intent, and complete trades without time-wasters.
          </p>

          <div style={S.ctas}>
            <Link href="/listings" style={S.btnPrimary}>Browse listings</Link>
            <Link href="/sell/new" style={S.btnGhost}>Create a listing</Link>
          </div>

          <div style={S.fine}>
            Bidra is a neutral marketplace platform — buyers and sellers trade directly. We provide tools, rules, and enforcement.
          </div>
        </div>
      </section>

      <section style={S.section}>
        <div style={S.sectionTitle}>Categories</div>
        <div style={S.card}>
  <HomeCategorySelectClient />
</div>
</section>

      <section style={S.section}>
        <div style={S.sectionTitle}>Latest listings</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {listings.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.6 }}>
              <div>No listings to show yet. Be the first to list an item.</div>
              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/sell/new" style={S.btnPrimary}>Create a listing</Link>
                <Link href="/listings" style={S.btnGhost}>Browse</Link>
              </div>
            </div>
          ) : (
            <>
              {listings.map((l: any) => (
                <ListingCard
                  key={l.id}
                  listing={{
                    id: l.id,
                    title: l.title,
                    description: l.description ?? null,
                    price: l.price,
                    buyNowPrice: l.buyNowPrice ?? null,
                    type: l.type,
                    category: l.category,
                    condition: l.condition ?? null,
                    location: l.location ?? null,
                    images: (l as any).images ?? null,
                  }}
                  initiallyWatched={false}
                />
              ))}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
