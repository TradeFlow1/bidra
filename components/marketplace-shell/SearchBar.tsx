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
    <section aria-label="Marketplace search panel" data-compact={compact ? "true" : "false"}>
      <div aria-hidden="true">
        <span>Listings</span>
        <span>Offers</span>
        <span>Buy Now</span>
      </div>
      <form action="#" role="search">
        <label aria-label={placeholder}>
          <input type="search" name="q" placeholder={placeholder} aria-label={placeholder} />
        </label>
        <label aria-label={locationPlaceholder}>
          <input type="text" name="location" placeholder={locationPlaceholder} aria-label={locationPlaceholder} />
        </label>
        {showButton ? (
          <button type="submit">Search</button>
        ) : null}
      </form>
    </section>
  );
}
