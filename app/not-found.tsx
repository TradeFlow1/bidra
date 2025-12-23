import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-neutral-600">
        The page you’re looking for doesn’t exist.
      </p>
      <Link className="mt-4 inline-block underline" href="/">
        Go back home
      </Link>
    </div>
  );
}
