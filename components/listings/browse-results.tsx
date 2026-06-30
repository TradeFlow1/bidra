import type { BrowseListing } from "./listing-types";
import { BrowseEmptyState } from "./browse-empty-state";
import { BrowseListingCard, BrowseListingMobileCard } from "./browse-listing-card";

export function BrowseResultsGrid({ listings }: { listings: BrowseListing[] }) {
  if (!listings.length) return <BrowseEmptyState />;

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <BrowseListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

export function BrowseMobileResults({ listings }: { listings: BrowseListing[] }) {
  if (!listings.length) return <BrowseEmptyState />;

  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <BrowseListingMobileCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}