import type { Metadata } from "next";
import {
  ActionPanel,
  CategoryRail,
  ListingGrid,
  MarketplaceShell,
  SellerCard,
  SearchBar,
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
  "Vehicles",
  "Sports and Outdoors",
  "Fashion",
  "Kids",
  "Garden",
  "Wanted",
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
  {
    id: "sample-shelf",
    title: "Storage shelf unit",
    location: "Logan, QLD",
    priceLabel: "$110",
    offerLabel: "Current offer $98",
    image: "/brand/hero-clouds.png",
    typeLabel: "Timed offer",
  },
  {
    id: "sample-monitor",
    title: "27 inch monitor",
    location: "Brisbane, QLD",
    priceLabel: "$210",
    image: "/brand/hero-clouds.png",
    typeLabel: "Buy Now",
  },
];

export default function HomePage() {
  return (
    <MarketplaceShell title="Home" activeNav="home">
      <section className="mk-panel mk-command-panel">
        <p className="mk-kicker">Marketplace command</p>
        <h1>Search, compare, and buy faster</h1>
        <SearchBar placeholder="What are you looking for?" locationPlaceholder="Suburb or postcode" />
      </section>

      <CategoryRail categories={categories} />

      <ListingGrid title="Active listings" items={listings} />

      <TrustStrip />

      <div className="mk-home-lower">
        <ActionPanel
          title="Sell your item"
          description="Create a listing in minutes and manage offers through messages."
          primaryLabel="Start selling"
          primaryHref="/sell/new"
          secondaryLabel="See selling tips"
          secondaryHref="/help"
        />
        <SellerCard
          seller={{
            name: "Trusted marketplace seller",
            suburb: "Brisbane, QLD",
            memberSince: "Jan 2025",
            response: "within 30 minutes",
          }}
        />
      </div>

      <footer className="mk-footer">Bidra marketplace prototype - search first, list fast, handover with confidence.</footer>
    </MarketplaceShell>
  );
}
