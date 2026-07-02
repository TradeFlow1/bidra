import ListingCard from "./ListingCard";
import type { ListingPreview } from "./types";

type ListingGridProps = {
  title: string;
  items: ListingPreview[];
};

export default function ListingGrid({ title, items }: ListingGridProps) {
  return (
    <section>
      <div>
        <h2>{title}</h2>
        <div>
          <span>{items.length} listings</span>
          <button type="button">Newest first</button>
        </div>
      </div>
      {items.length > 0 ? (
        <div>
          {items.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p>No listings yet. Check nearby and popular modules.</p>
      )}
    </section>
  );
}
