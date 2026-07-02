import Link from "next/link";

type CategoryRailProps = {
  categories: string[];
};

export default function CategoryRail({ categories }: CategoryRailProps) {
  return (
    <section>
      <div>
        <h2>Categories</h2>
        <Link href="/categories">View all</Link>
      </div>
      <ul aria-label="Marketplace categories">
        {categories.map((category) => (
          <li key={category}>
            <Link href="/listings">{category}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
