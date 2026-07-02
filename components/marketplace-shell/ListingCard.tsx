import Image from "next/image";
import Link from "next/link";
import type { ListingPreview } from "./types";

type ListingCardProps = {
  item: ListingPreview;
};

export default function ListingCard({ item }: ListingCardProps) {
  return (
    <article>
      <Link href={`/listings/${item.id}`} aria-label={item.title}>
        <Image src={item.image} alt="" width={420} height={300} unoptimized />
        {item.featured ? <span>Featured listing</span> : null}
      </Link>
      <div>
        <div>
          <span>Local pickup</span>
          <span>Updated today</span>
        </div>
        <div>
          <p>{item.typeLabel}</p>
          <p>{item.priceLabel}</p>
        </div>
        <h3>{item.title}</h3>
        <p>{item.location}</p>
        {item.offerLabel ? <p>{item.offerLabel}</p> : null}
        <div>
          <Link href={`/listings/${item.id}`}>View details</Link>
          <Link href={`/messages/${item.id}`}>Message</Link>
        </div>
      </div>
    </article>
  );
}
