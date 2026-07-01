import Image from "next/image";
import Link from "next/link";
import type { ListingPreview } from "./types";

type ListingCardProps = {
  item: ListingPreview;
};

export default function ListingCard({ item }: ListingCardProps) {
  return (
    <article className="mk-listing-card">
      <Link href={`/listings/${item.id}`} className="mk-listing-media" aria-label={item.title}>
        <Image src={item.image} alt="" width={420} height={300} unoptimized className="mk-listing-image" />
        {item.featured ? <span className="mk-listing-tag">Featured listing</span> : null}
      </Link>
      <div className="mk-listing-body">
        <div className="mk-listing-top">
          <p className="mk-listing-type">{item.typeLabel}</p>
          <p className="mk-listing-price">{item.priceLabel}</p>
        </div>
        <h3>{item.title}</h3>
        <p className="mk-listing-location">{item.location}</p>
        {item.offerLabel ? <p className="mk-listing-offer">{item.offerLabel}</p> : null}
        <div className="mk-listing-foot">
          <Link href={`/listings/${item.id}`} className="mk-inline-link">
            View details
          </Link>
          <Link href={`/messages/${item.id}`} className="mk-inline-link mk-inline-link-ghost">
            Message
          </Link>
        </div>
      </div>
    </article>
  );
}
