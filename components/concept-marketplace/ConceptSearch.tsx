type ConceptSearchProps = {
  compact?: boolean;
  placeholder?: string;
};

export default function ConceptSearch({
  compact = false,
  placeholder = "Search listings across Australia",
}: ConceptSearchProps) {
  return (
    <section className={compact ? "cm-search cm-search-compact" : "cm-search"} aria-label="Marketplace search">
      <div className="cm-search-tabs" aria-hidden="true">
        <span className="cm-tab cm-tab-active">Listings</span>
        <span className="cm-tab">Offers</span>
        <span className="cm-tab">Buy Now</span>
      </div>
      <form className="cm-search-row" action="#" role="search">
        <label className="cm-input-wrap" aria-label={placeholder}>
          <span className="cm-input-icon">Q</span>
          <input type="search" name="q" placeholder={placeholder} aria-label={placeholder} />
        </label>
        <label className="cm-input-wrap cm-input-location" aria-label="Location">
          <span className="cm-input-icon">L</span>
          <input type="text" name="location" placeholder="Suburb or postcode" aria-label="Suburb or postcode" />
        </label>
        <button type="submit" className="cm-btn cm-btn-primary">Search</button>
      </form>
    </section>
  );
}
