import Link from "next/link";
import Image from "next/image";
import { BidraTrustCue } from "./BidraTrustCue";
import type { BidraListing } from "./types";

type BidraListingCardProps = {
  listing: BidraListing;
};

export function BidraListingCard({ listing }: BidraListingCardProps) {
  return (
    <article className="bidra-listing-card" aria-label={listing.title}>
      <Link href={`/listings/${listing.id}`} className="bidra-listing-card__image-wrap" aria-label={`Open ${listing.title}`}>
        <Image
          src={listing.imageSrc}
          alt={listing.imageAlt}
          fill
          sizes="(max-width: 699px) 50vw, (max-width: 959px) 33vw, 25vw"
          className="bidra-listing-card__image"
        />
        <span className="bidra-listing-card__mode">{listing.mode}</span>
        {listing.featured ? <span className="bidra-listing-card__featured">Featured listing</span> : null}
      </Link>

      <div className="bidra-listing-card__content">
        <div className="bidra-listing-card__topline">
          <span className="bidra-listing-card__seller">{listing.seller}</span>
          <BidraTrustCue text={listing.sellerRating} />
        </div>

        <h3>
          <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
        </h3>

        <p className="bidra-listing-card__price">{listing.price}</p>

        <p className="bidra-listing-card__location">{listing.location}</p>

        {listing.offerSummary ? <p className="bidra-listing-card__offer">{listing.offerSummary}</p> : null}

        <div className="bidra-listing-card__actions">
          <Link href={`/messages?listing=${listing.id}`} className="bidra-listing-card__action bidra-listing-card__action--primary">
            Message seller
          </Link>
          <button type="button" className="bidra-listing-card__action" aria-pressed={Boolean(listing.isSaved)}>
            {listing.isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}
