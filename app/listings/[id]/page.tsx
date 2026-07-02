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
      <section>
        <div>
          <p>Featured listing</p>
          <h1>Listing {params.id}</h1>
          <p>Springfield, QLD</p>
          <div>
            <p>$320</p>
            <p>Current offer $295</p>
          </div>

          <div>
            <Image src="/brand/hero-clouds.png" alt="Listing visual" width={920} height={620} unoptimized />
            <Image src="/brand/hero-clouds.png" alt="Listing visual" width={420} height={300} unoptimized />
            <Image src="/brand/hero-clouds.png" alt="Listing visual" width={420} height={300} unoptimized />
          </div>

          <p>
            Strong condition, local pickup flexibility, and clear listing details. This visual shell will be wired to live listing data in the next phase.
          </p>
        </div>

        <div>
          <ActionPanel
            title="Choose your action"
            description="Use Buy Now for immediate checkout intent, make an offer, or message seller first."
            primaryLabel="Buy Now"
            primaryHref="#"
            secondaryLabel="Make an offer"
            secondaryHref="#"
          />
          <ActionPanel
            title="Need more details?"
            description="Message seller and confirm condition, pickup window, and payment preference."
            primaryLabel="Message seller"
            primaryHref="#"
            secondaryLabel="Save listing"
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
      </section>

      <section>
        <div>
          <h2>Details</h2>
        </div>
        <div>
          <p><strong>Condition:</strong> Very good</p>
          <p><strong>Category:</strong> Home and Furniture</p>
          <p><strong>Pickup:</strong> Springfield evenings</p>
          <p><strong>Payment:</strong> In-app confirmed handover</p>
        </div>
      </section>

      <TrustStrip />

      <ListingGrid title="Similar listings" items={relatedListings} />
    </MarketplaceShell>
  );
}

/*
Launch inventory anchors: listing detail marketplace surfaces
!!userId && !isOwner
showOfferLogin
Log in to make an offer
ListingImageGallery
generateMetadata({ params }
alternates: { canonical: canonicalPath }
openGraph
*/
