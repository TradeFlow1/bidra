export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function dollars(cents: number | null | undefined) {
  if (typeof cents !== "number") return "";
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?next=/watchlist");

  async function removeWatch(formData: FormData) {
    "use server";
    const listingId = String(formData.get("listingId") || "").trim();
    if (!listingId) return;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;

    await prisma.watchlist.deleteMany({
      where: { userId: session.user.id, listingId , listing: { status: "ACTIVE" } },
    });

    revalidatePath("/watchlist");
  }

  const userId = session.user.id;

  const items = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      createdAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          category: true,
          location: true,
          type: true,
          price: true,
        },
      },
    },
  });

  const wrap: React.CSSProperties = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  };

  const card: React.CSSProperties = {
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 14,
    padding: 14,
    background: "#fff",
  };

  const btnPrimary: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  };

  const btnGhostLink: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    color: "#111827",
    fontWeight: 900,
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <main style={wrap}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Watchlist</h1>
          <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.75 }}>
            Listings youâ€™ve saved.
          </p>
        </div>

        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/listings" style={{ textDecoration: "underline" }}>Browse</Link>
          <Link href="/sell" style={{ textDecoration: "underline" }}>Sell</Link>
          <Link href="/account" style={{ textDecoration: "underline" }}>My account</Link>
        </nav>
      </header>

      <section style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {items.length === 0 ? (
          <div style={{ ...card, opacity: 0.85 }}>
            No watched listings yet.
            <div style={{ marginTop: 10 }}>
              <Link href="/listings" style={{ ...btnGhostLink }}>Browse listings</Link>
            </div>
          </div>
        ) : (
          items.map((w) => (
            <div key={w.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ minWidth: 280 }}>
                  <Link href={`/listings/${w.listing.id}`} style={{ textDecoration: "underline", fontWeight: 900 }}>
                    {w.listing.title}
                  </Link>

                  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
                    {w.listing.category ? <span>{w.listing.category}</span> : null}
                    {w.listing.category && w.listing.location ? <span> â€¢ </span> : null}
                    {w.listing.location ? <span>{w.listing.location}</span> : null}
                    {(w.listing.category || w.listing.location) && w.listing.type ? <span> â€¢ </span> : null}
                    {w.listing.type ? <span>{w.listing.type}</span> : null}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ fontWeight: 900 }}>{dollars(w.listing.price)}</div>

                  <Link href={`/listings/${w.listing.id}`} style={btnGhostLink}>
                    View
                  </Link>

                  <form action={removeWatch}>
                    <input type="hidden" name="listingId" value={w.listing.id} />
                    <button type="submit" style={btnPrimary}>Remove</button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
