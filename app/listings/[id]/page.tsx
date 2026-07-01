import type { Metadata } from "next";
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
      <TrustStrip />

      <section className="mk-panel">
        <p className="mk-listing-type">Featured listing</p>
        <h1 className="mt-1 text-2xl font-extrabold">Listing {params.id}</h1>
        <p className="mt-1 text-sm text-[var(--mk-muted)]">Springfield, QLD</p>
        <p className="mt-2 text-3xl font-black">$320</p>
        <p className="mt-2 text-sm text-[var(--mk-muted)]">Current offer $295</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <img src="/brand/hero-clouds.png" alt="Listing visual" className="h-[220px] w-full rounded-xl object-cover" />
          <img src="/brand/hero-clouds.png" alt="Listing visual" className="h-[220px] w-full rounded-xl object-cover" />
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--mk-muted)]">
          This is a visual shell for listing detail. The final data wiring will plug into this layout without changing backend offer and Buy Now logic.
        </p>
      </section>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ListingGrid title="Similar listings" items={relatedListings} />

        <div>
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
