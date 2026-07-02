import Link from "next/link";

type ConceptCategoryRailProps = {
  categories: string[];
};

export default function ConceptCategoryRail({ categories }: ConceptCategoryRailProps) {
  return (
    <section className="cm-panel cm-categories" aria-label="Categories">
      <div className="cm-panel-head">
        <h2>Categories</h2>
        <Link href="/concept/listings">See all</Link>
      </div>
      <div className="cm-rail" role="list">
        {categories.map((category) => (
          <Link key={category} href="/concept/listings" role="listitem" className="cm-chip">
            {category}
          </Link>
        ))}
      </div>
    </section>
  );
}
