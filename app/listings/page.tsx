import type { Metadata } from "next";
import {
  ActionPanel,
  CategoryRail,
  ListingGrid,
  MarketplaceShell,
  TrustStrip,
  type ListingPreview,
} from "@/components/marketplace-shell";

export const metadata: Metadata = {
  title: "Browse listings | Bidra",
  description: "Browse Australian listings with strong search and fast filters.",
};

const categories = [
  "All listings",
  "Home and Furniture",
  "Tech and Electronics",
  "Tools and DIY",
  "Vehicles",
  "Sports and Outdoors",
  "Wanted requests",
];

const browseListings: ListingPreview[] = [
  {
    id: "b1",
    title: "Bicycle - commuter ready",
    location: "Redbank Plains, QLD",
    priceLabel: "$380",
    offerLabel: "Current offer $340",
    image: "/brand/hero-clouds.png",
    typeLabel: "Timed offer",
  },
  {
    id: "b2",
    title: "Hand tools bundle",
    location: "Ipswich, QLD",
    priceLabel: "$80",
    image: "/brand/hero-clouds.png",
    typeLabel: "Buy Now",
  },
  {
    id: "b3",
    title: "Decor candles set",
    location: "Springfield, QLD",
    priceLabel: "$45",
    offerLabel: "Highest offer $35",
    image: "/brand/hero-clouds.png",
    typeLabel: "Offers open",
  },
  {
    id: "b4",
    title: "Outdoor storage box",
    location: "Brisbane, QLD",
    priceLabel: "$120",
    image: "/brand/hero-clouds.png",
    typeLabel: "Buy Now",
    featured: true,
  },
  {
    id: "b5",
    title: "Kids bike 20 inch",
    location: "Toowoomba, QLD",
    priceLabel: "$95",
    offerLabel: "Current offer $88",
    image: "/brand/hero-clouds.png",
    typeLabel: "Timed offer",
  },
  {
    id: "b6",
    title: "Gaming monitor 27 inch",
    location: "Gold Coast, QLD",
    priceLabel: "$220",
    image: "/brand/hero-clouds.png",
    typeLabel: "Buy Now",
  },
];

export default function ListingsPage() {
  return (
    <MarketplaceShell title="Browse" activeNav="browse">
      <section className="mk-panel mk-home-intro mk-home-intro-tight">
        <p className="mk-kicker">Browse</p>
        <h1>Search and filter listings</h1>
        <p>Dense results, cleaner filters, and quicker decisions.</p>
      </section>

      <section className="mk-panel mk-filter-shell">
        <div className="mk-panel-head">
          <h2>Search and filters</h2>
          <span className="mk-thread-pill">Updated just now</span>
        </div>
        <div className="mk-filter-grid">
          <input type="text" placeholder="Search listings" aria-label="Search listings" />
          <select defaultValue="all" aria-label="Category">
            <option value="all">All categories</option>
            <option value="home">Home and Furniture</option>
            <option value="tech">Tech and Electronics</option>
            <option value="tools">Tools and DIY</option>
          </select>
          <select defaultValue="all" aria-label="Sale type">
            <option value="all">Buy Now and offers</option>
            <option value="buy-now">Buy Now only</option>
            <option value="timed-offer">Timed offers</option>
          </select>
          <input type="text" placeholder="Location" aria-label="Location" />
        </div>
      </section>

      <CategoryRail categories={categories} />
      <TrustStrip />

      <div className="mk-app-grid">
        <ListingGrid title="Browse" items={browseListings} />
        <ActionPanel
          title="Need it quickly?"
          description="Use Buy Now for instant checkout intent, or make an offer and wait for seller choice."
          primaryLabel="Create wanted request"
          primaryHref="/wanted/new"
          secondaryLabel="View messages"
          secondaryHref="/messages"
        />
      </div>
    </MarketplaceShell>
  );
}
