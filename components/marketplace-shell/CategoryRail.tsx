import Link from "next/link";

type CategoryRailProps = {
  categories: string[];
};

export default function CategoryRail({ categories }: CategoryRailProps) {
  return (
    <section className="mk-panel">
      <div className="mk-panel-head">
        <h2>Explore categories</h2>
        <Link href="/categories">View all</Link>
      </div>
      <div className="mk-rail" role="list" aria-label="Marketplace categories">
        {categories.map((category, index) => (
          <Link key={category} href="/listings" role="listitem" className="mk-chip">
            <span className="mk-chip-kicker">{String(index + 1).padStart(2, "0")}</span>
            <span>{category}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
