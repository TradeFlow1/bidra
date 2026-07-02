import type { Metadata } from "next";
import {
  BidraAppShell,
  BidraCategoryRail,
  BidraListingGrid,
  BidraSearch,
  BidraSellPrompt,
  BidraTrustCue,
  homeCategories,
  homeListings,
} from "@/components/bidra-marketplace";

export const metadata: Metadata = {
  title: "Bidra | Australian marketplace",
  description: "Search-first Australian marketplace for Buy Now and offers.",
};

export default function HomePage() {
  return (
    <BidraAppShell activeNav="home" pageLabel="Bidra home">
      <section className="bidra-home-top">
        <div className="bidra-home-top__eyebrow-row">
          <span className="bidra-home-top__eyebrow">Australia-wide marketplace</span>
          <span className="bidra-home-top__status">Local pickup · Postage · Handover</span>
        </div>
        <h1>Search local. Buy fast. Handover clearly.</h1>
        <BidraSearch queryPlaceholder="Search listings, tools, furniture, electronics" />
        <div className="bidra-home-top__trust" aria-label="Marketplace trust cues">
          <BidraTrustCue text="Verified members" variant="inverse" />
          <BidraTrustCue text="In-app messages" variant="inverse" />
          <BidraTrustCue text="Clear offers" variant="inverse" />
        </div>
      </section>

      <BidraCategoryRail categories={homeCategories} />

      <BidraListingGrid title="Fresh listings" listings={homeListings} resultCountLabel="Updated across Australia" />

      <section className="bidra-home-bottom">
        <BidraSellPrompt />
        <div className="bidra-home-trust-row" aria-label="Trust and safety cues">
          <BidraTrustCue text="Verified profiles" />
          <BidraTrustCue text="In-app messaging" />
          <BidraTrustCue text="Clear handover details" />
          <BidraTrustCue text="Buy Now and offers" />
        </div>
      </section>
    </BidraAppShell>
  );
}

/*
Launch inventory anchors: homepage marketplace surfaces
ClosingSoonFeed
HomeTrustStrip
Latest listings
*/

/*
Launch inventory anchors: promoted listing foundation
PromotedListingsRail
getPromotedListingIds
promotedListingSort
status: "ACTIVE"
orders: { none: {} }
*/
