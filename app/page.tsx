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
        <h1>Find what you need, close to you.</h1>
        <BidraSearch queryPlaceholder="Search listings, tools, furniture, electronics" />
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
