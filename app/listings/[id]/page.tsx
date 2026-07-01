import type { Metadata } from "next";
import Image from "next/image";
import {
  ActionPanel,
  ListingGrid,
  MarketplaceShell,
  SellerCard,
  TrustStrip,
  type ListingPreview,
} from "@/components/marketplace-shell";

export const metadata: Metadata = {
  title: "Listing detail | Bidra",
  description: "Listing detail shell for visual rebuild.",
};

const relatedListings: ListingPreview[] = [
  {
    id: "r1",
    title: "Compact bookshelf",
    location: "Brisbane, QLD",
    priceLabel: "$90",
    image: "/brand/hero-clouds.png",
    typeLabel: "Buy Now",
  },
  {
    id: "r2",
    title: "Modern desk lamp",
    location: "Ipswich, QLD",
    priceLabel: "$35",
    offerLabel: "Current offer $28",
    image: "/brand/hero-clouds.png",
    typeLabel: "Timed offer",
  },
  {
    id: "r3",
    title: "Storage trunk",
    location: "Logan, QLD",
    priceLabel: "$75",
    image: "/brand/hero-clouds.png",
    typeLabel: "Offers open",
  },
  {
    id: "r4",
    title: "Dining chair set",
    location: "Gold Coast, QLD",
    priceLabel: "$140",
    image: "/brand/hero-clouds.png",
    typeLabel: "Buy Now",
  },
];

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  return (
    <MarketplaceShell title="Listing" activeNav="browse">
      <section className="mk-detail-head mk-panel">
        <p className="mk-listing-type">Featured listing</p>
        <h1>Listing {params.id}</h1>
        <p className="mk-detail-location">Springfield, QLD</p>
        <div className="mk-detail-price-row">
          <p className="mk-detail-price">$320</p>
          <p className="mk-detail-offer">Current offer $295</p>
        </div>

        <div className="mk-detail-gallery">
          <Image src="/brand/hero-clouds.png" alt="Listing visual" width={920} height={620} className="mk-detail-image mk-detail-image-main" unoptimized />
          <Image src="/brand/hero-clouds.png" alt="Listing visual" width={420} height={300} className="mk-detail-image" unoptimized />
          <Image src="/brand/hero-clouds.png" alt="Listing visual" width={420} height={300} className="mk-detail-image" unoptimized />
        </div>

        <p className="mk-detail-copy">
          This is a visual shell for listing detail. The final data wiring will plug into this layout without changing backend offer and Buy Now logic.
        </p>
      </section>

      <TrustStrip />

      <div className="mk-app-grid">
        <ListingGrid title="Similar listings" items={relatedListings} />

        <div className="mk-side-stack">
          <ActionPanel
            title="Take action"
            description="Choose Buy Now for immediate checkout intent or make an offer and wait for seller selection."
            primaryLabel="Make an offer"
            primaryHref="#"
            secondaryLabel="Buy Now"
            secondaryHref="#"
          />
          <SellerCard
            seller={{
              name: "Taylor Smith",
              suburb: "Springfield, QLD",
              memberSince: "Feb 2025",
              response: "within 20 minutes",
            }}
          />
        </div>
      </div>
    </MarketplaceShell>
  );
}
