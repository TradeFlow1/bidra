import type { Metadata } from "next";
import {
  ActionPanel,
  CategoryRail,
  ListingGrid,
  MarketplaceShell,
  SellerCard,
  TrustStrip,
  type ListingPreview,
} from "@/components/marketplace-shell";

export const metadata: Metadata = {
  title: "Bidra | Australian marketplace",
  description: "Easy buying and easy selling across Australia with Buy Now and offers.",
};

const categories = [
  "Home and Furniture",
  "Tech and Electronics",
  "Tools and DIY",
  "Sports and Outdoors",
  "Fashion and Wearables",
  "Kids and Toys",
  "Books and Media",
  "Wanted requests",
];

const listings: ListingPreview[] = [
  {
    id: "sample-bike",
    title: "City commuter bike",
    location: "Redbank Plains, QLD",
    priceLabel: "$420",
    offerLabel: "Current offer $390",
    image: "/brand/hero-clouds.png",
    typeLabel: "Timed offer",
    featured: true,
  },
  {
    id: "sample-tools",
    title: "Tool set with carry case",
    location: "Springfield, QLD",
    priceLabel: "$85",
    image: "/brand/hero-clouds.png",
    typeLabel: "Buy Now",
  },
  {
    id: "sample-sofa",
    title: "Compact three seat sofa",
    location: "Brisbane, QLD",
    priceLabel: "$310",
    offerLabel: "Highest offer $270",
    image: "/brand/hero-clouds.png",
    typeLabel: "Offers open",
  },
  {
    id: "sample-camp",
    title: "Camping chairs pair",
    location: "Ipswich, QLD",
    priceLabel: "$65",
    image: "/brand/hero-clouds.png",
    typeLabel: "Buy Now",
  },
];

export default function HomePage() {
  return (
    <MarketplaceShell title="Home" activeNav="home">
      <section className="mk-panel mk-home-intro">
        <p className="mk-kicker">Marketplace app</p>
        <h1>Find what you need nearby</h1>
        <p>Search first, compare listings quickly, and chat with sellers in one place.</p>
      </section>

      <CategoryRail categories={categories} />
      <TrustStrip />

      <div className="mk-app-grid">
        <ListingGrid title="Latest listings" items={listings} />
        <div className="mk-side-stack">
          <ActionPanel
            title="Ready to sell today?"
            description="Post in minutes, accept offers, and confirm handover in messages."
            primaryLabel="Sell an item"
            primaryHref="/sell/new"
            secondaryLabel="Browse listings"
            secondaryHref="/listings"
          />
          <SellerCard
            seller={{
              name: "Local trusted seller",
              suburb: "Brisbane, QLD",
              memberSince: "Jan 2025",
              response: "within 30 minutes",
            }}
          />
        </div>
      </div>
    </MarketplaceShell>
  );
}
