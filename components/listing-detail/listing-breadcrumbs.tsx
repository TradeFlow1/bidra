import Link from "next/link";

export function ListingBreadcrumbs({ category }: { category: string }) {
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-3 text-sm font-bold text-[#62516F]">
      <Link href="/" className="text-[#6D28D9] hover:underline">Home</Link>
      <span className="text-[#C4B5FD]">&gt;</span>
      <Link href="/listings" className="text-[#6D28D9] hover:underline">Listings</Link>
      <span className="text-[#C4B5FD]">&gt;</span>
      <span>{category}</span>
    </nav>
  );
}