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
          <h1>Browse listings</h1>
          <p>12,400 active results</p>
        </div>
        <BidraSearch queryPlaceholder="Search listings" locationPlaceholder="All Australia" compact />
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
