import ListingCard from "./ListingCard";
import type { ListingPreview } from "./types";

type ListingGridProps = {
  title: string;
  items: ListingPreview[];
};

export default function ListingGrid({ title, items }: ListingGridProps) {
  return (
    <section className="mk-panel">
      <div className="mk-panel-head">
        <h2>{title}</h2>
      </div>
      <div className="mk-grid">
        {items.map((item) => (
          <ListingCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
