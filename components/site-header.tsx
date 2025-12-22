import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="w-full border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold">
          Bidra
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link className="underline" href="/listings">
            Browse listings
          </Link>

          <Link className="underline" href="/sell">
            Sell
          </Link>

          <Link className="underline" href="/auth/login">
            Log in
          </Link>

          <Link className="underline" href="/auth/register">
            Create account
          </Link>
        </nav>
      </div>
    </header>
  );
}

// Keep default export too, so BOTH import styles work:
// import SiteHeader from "..."
// import { SiteHeader } from "..."
export default SiteHeader;
