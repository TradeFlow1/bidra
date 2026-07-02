type BidraCategoryRailProps = {
  categories: string[];
};

export function BidraCategoryRail({ categories }: BidraCategoryRailProps) {
  return (
    <section className="bidra-category-rail" aria-label="Browse by category">
      <h2>Categories</h2>
      <div className="bidra-category-rail__scroll" role="list">
        {categories.map((category) => (
          <a key={category} className="bidra-category-chip" href={`/listings?category=${encodeURIComponent(category)}`} role="listitem">
            {category}
          </a>
        ))}
      </div>
    </section>
  );
}
