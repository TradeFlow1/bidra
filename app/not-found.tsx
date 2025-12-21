import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-neutral-700">The page youÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢re looking for doesnÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢t exist.</p>
      <div className="mt-4 flex gap-3">
        <Link href="/" className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium">Home</Link>
        <Link href="/listings" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">Browse</Link>
      </div>
    </div>
  );
}
