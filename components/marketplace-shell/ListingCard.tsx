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
        <p className="mk-listing-type">{item.typeLabel}</p>
        <h3>{item.title}</h3>
        <p className="mk-listing-location">{item.location}</p>
        <p className="mk-listing-price">{item.priceLabel}</p>
        {item.offerLabel ? <p className="mk-listing-offer">{item.offerLabel}</p> : null}
      </div>
    </article>
  );
}
