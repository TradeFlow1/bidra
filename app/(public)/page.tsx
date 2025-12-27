export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <section style={{ marginTop: 18 }}>
        <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.15 }}>Bidra (SEQ Beta)</h1>

        <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.8 }}>
          Local buy/sell & auctions for the South East Queensland corridor (Toowoomba -&gt; Sunshine Coast -&gt; Coolangatta).
        </p>

        <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.8 }}>
          Need help? Visit <Link href="/help">Help</Link>.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 10 }}>Popular categories (Beta)</h2>
        <ul style={{ lineHeight: 1.7 }}>
          <li><Link href="/listings?category=Home%20%26%20Furniture">Home & Furniture</Link></li>
          <li><Link href="/listings?category=Tech%20%26%20Electronics">Tech & Electronics</Link></li>
          <li><Link href="/listings?category=Fashion%20%26%20Wearables">Fashion & Wearables</Link></li>
          <li><Link href="/listings?category=Sports%20%26%20Outdoors">Sports & Outdoors</Link></li>
          <li><Link href="/listings?category=Kids%20%26%20Toys">Kids & Toys</Link></li>
          <li><Link href="/listings?category=Appliances">Appliances</Link></li>
          <li><Link href="/listings?category=Tools%20%26%20DIY">Tools & DIY</Link></li>
          <li><Link href="/listings?category=Books%20%26%20Media">Books & Media</Link></li>
          <li><Link href="/listings?category=Collectibles%20%26%20Vintage">Collectibles & Vintage</Link></li>
          <li><Link href="/listings?category=Seasonal%20Goods">Seasonal Goods</Link></li>
        </ul>
      </section>

      <footer style={{ marginTop: 40, opacity: 0.7 }}>
        <p style={{ margin: 0 }}>SEQ beta. Not Australia-wide yet.</p>
      </footer>
    </main>
  );
}