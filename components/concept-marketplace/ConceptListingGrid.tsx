import ConceptListingCard, { type ConceptListing } from "./ConceptListingCard";

type ConceptListingGridProps = {
  title: string;
  subtitle?: string;
  items: ConceptListing[];
};

export default function ConceptListingGrid({ title, subtitle, items }: ConceptListingGridProps) {
  return (
    <section className="cm-panel cm-grid-panel">
      <div className="cm-panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="cm-subhead">{subtitle}</p> : null}
        </div>
        <div className="cm-grid-meta">
          <span>{items.length} listings</span>
          <button type="button" className="cm-btn cm-btn-outline">Newest</button>
        </div>
      </div>
      <div className="cm-grid">
        {items.map((item) => (
          <ConceptListingCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
