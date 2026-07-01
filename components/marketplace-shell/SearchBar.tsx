type SearchBarProps = {
  placeholder?: string;
  compact?: boolean;
};

export default function SearchBar({
  placeholder = "Search listings",
  compact = false,
}: SearchBarProps) {
  return (
    <form className={compact ? "mk-search mk-search-compact" : "mk-search"} action="#" role="search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.4-3.4" />
      </svg>
      <input type="search" name="q" placeholder={placeholder} aria-label={placeholder} />
    </form>
  );
}
