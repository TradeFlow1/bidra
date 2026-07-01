import Link from "next/link";

type CategoryRailProps = {
  categories: string[];
};

export default function CategoryRail({ categories }: CategoryRailProps) {
  return (
    <section className="mk-panel mk-category-panel">
      <div className="mk-panel-head">
        <h2>Categories</h2>
        <Link href="/categories">View all</Link>
      </div>
      <div className="mk-rail" role="list" aria-label="Marketplace categories">
        {categories.map((category) => (
          <Link key={category} href="/listings" role="listitem" className="mk-chip">
            <span>{category}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
