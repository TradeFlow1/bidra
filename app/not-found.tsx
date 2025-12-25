import Link from "next/link";

export default function NotFound() {
  return (
    <main className="py-10">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm opacity-80">
        The page you’re looking for doesn’t exist.
      </p>

      <div className="mt-6 flex gap-3">
        <Link href="/" className="rounded-xl bg-black px-4 py-2 text-white">
          Go home
        </Link>
        <Link href="/listings" className="rounded-xl border bg-white px-4 py-2">
          Browse listings
        </Link>
      </div>
    </main>
  );
}
