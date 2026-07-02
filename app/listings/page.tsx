import type { Metadata } from "next";
import {
  BidraAppShell,
  BidraCategoryRail,
  BidraListingGrid,
  BidraSearch,
  BidraTrustCue,
  browseCategories,
  browseListings,
} from "@/components/bidra-marketplace";

export const metadata: Metadata = {
  title: "Browse listings | Bidra",
  description: "Browse Australian marketplace listings with compact search and filters.",
};

export default function ListingsPage() {
  return (
    <BidraAppShell activeNav="listings" pageLabel="Browse listings">
      <section className="bidra-browse-top">
        <div className="bidra-browse-top__head">
          <div>
            <span className="bidra-page-kicker">Browse</span>
            <h1>Find active listings fast</h1>
          </div>
          <p>12,400 results</p>
        </div>
        <BidraSearch queryPlaceholder="Search listings" locationPlaceholder="All Australia" compact />
        <div className="bidra-browse-top__filters" aria-label="Quick listing filters">
          <a href="/listings" className="bidra-filter-chip is-active">
            All Australia
          </a>
          <a href="/listings?mode=buy-now" className="bidra-filter-chip">
            Buy Now
          </a>
          <a href="/listings?mode=offers" className="bidra-filter-chip">
            Offers
          </a>
          <a href="/listings?pickup=local" className="bidra-filter-chip">
            Local pickup
          </a>
          <a href="/listings?delivery=postage" className="bidra-filter-chip">
            Postage
          </a>
        </div>
      </section>

      <BidraCategoryRail categories={browseCategories} />

      <section className="bidra-browse-trust-row" aria-label="Compact trust cues">
        <BidraTrustCue text="Profile checks" />
        <BidraTrustCue text="Secure messages" />
        <BidraTrustCue text="Clear offer state" />
      </section>

      <BidraListingGrid title="All listings" listings={browseListings} resultCountLabel="Showing newest first" />
    </BidraAppShell>
  );
}

/*
Launch inventory anchors: listings keyword flow
selectedQuery
name="q"
contains: selectedQuery
Search: {selectedQuery}
*/
