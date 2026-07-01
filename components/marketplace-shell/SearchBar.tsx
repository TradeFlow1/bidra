type SearchBarProps = {
  placeholder?: string;
  compact?: boolean;
  locationPlaceholder?: string;
  showButton?: boolean;
};

export default function SearchBar({
  placeholder = "Search listings, brands, and categories",
  compact = false,
  locationPlaceholder = "Location",
  showButton = true,
}: SearchBarProps) {
  return (
    <form className={compact ? "mk-search mk-search-compact" : "mk-search"} action="#" role="search">
      <label className="mk-search-field" aria-label={placeholder}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.4-3.4" />
        </svg>
        <input type="search" name="q" placeholder={placeholder} aria-label={placeholder} />
      </label>
      <label className="mk-search-field mk-search-field-location" aria-label={locationPlaceholder}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10Z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
        <input type="text" name="location" placeholder={locationPlaceholder} aria-label={locationPlaceholder} />
      </label>
      {showButton ? (
        <button type="submit" className="mk-search-submit">
          Search
        </button>
      ) : null}
    </form>
  );
}
