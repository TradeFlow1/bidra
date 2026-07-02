import Image from "next/image";
import Link from "next/link";

export type ConceptListing = {
  id: string;
  title: string;
  location: string;
  price: string;
  offer?: string;
  mode: "Buy Now" | "Timed offer" | "Offers open";
  image: string;
  featured?: boolean;
};

type ConceptListingCardProps = {
  item: ConceptListing;
};

export default function ConceptListingCard({ item }: ConceptListingCardProps) {
  return (
    <article className="cm-card">
      <Link href="/concept/listing" className="cm-card-media" aria-label={item.title}>
        <Image src={item.image} alt="" width={640} height={420} unoptimized className="cm-card-image" />
        {item.featured ? <span className="cm-badge">Featured listing</span> : null}
        <span className="cm-price-chip">{item.price}</span>
      </Link>

      <div className="cm-card-body">
        <div className="cm-card-top">
          <p className="cm-mode">{item.mode}</p>
          <span className="cm-mini-pill">Verified seller</span>
        </div>
        <h3>{item.title}</h3>
        <p className="cm-location">{item.location}</p>
        {item.offer ? <p className="cm-offer">{item.offer}</p> : <p className="cm-offer">No offer yet</p>}
        <div className="cm-card-actions">
          <Link href="/concept/listing" className="cm-btn cm-btn-soft">View</Link>
          <Link href="/concept/messages" className="cm-btn cm-btn-outline">Message</Link>
          <button type="button" className="cm-btn cm-btn-ghost">Save</button>
        </div>
      </div>
    </article>
  );
}
