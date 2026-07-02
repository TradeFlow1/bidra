import { BidraListingCard } from "./BidraListingCard";
import type { BidraListing } from "./types";

type BidraListingGridProps = {
  title: string;
  listings: BidraListing[];
  resultCountLabel?: string;
};

export function BidraListingGrid({ title, listings, resultCountLabel }: BidraListingGridProps) {
  return (
    <section className="bidra-listing-grid" aria-label={title}>
      <div className="bidra-listing-grid__head">
        <h2>{title}</h2>
        {resultCountLabel ? <p>{resultCountLabel}</p> : <p>{listings.length} results</p>}
      </div>

      <div className="bidra-listing-grid__grid">
        {listings.map((listing) => (
          <BidraListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
