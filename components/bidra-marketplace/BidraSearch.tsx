type BidraSearchProps = {
  queryPlaceholder?: string;
  locationPlaceholder?: string;
  compact?: boolean;
};

export function BidraSearch({
  queryPlaceholder = "Search listings",
  locationPlaceholder = "Suburb or postcode",
  compact = false,
}: BidraSearchProps) {
  return (
    <form className={`bidra-search${compact ? " bidra-search--compact" : ""}`} role="search" action="/listings" method="get">
      <label className="bidra-search__field" htmlFor="bidra-search-query">
        <span className="bidra-search__label">What are you looking for?</span>
        <input
          id="bidra-search-query"
          name="q"
          type="search"
          placeholder={queryPlaceholder}
          autoComplete="off"
        />
      </label>

      <label className="bidra-search__field" htmlFor="bidra-search-location">
        <span className="bidra-search__label">Location</span>
        <input
          id="bidra-search-location"
          name="location"
          type="text"
          placeholder={locationPlaceholder}
          autoComplete="off"
        />
      </label>

      <button className="bidra-search__submit" type="submit">
        Search
      </button>
    </form>
  );
}
