import Link from "next/link";
import { Card } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
      {/* Hero */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Buy, sell, and bid - built for Australia.
        </h1>

        <p className="mt-3 text-neutral-700">
          Bidra is a modern marketplace with auctions and buy-now listings.
          Watch favourites, message sellers, and complete purchases via secure
          checkout (Stripe test mode in MVP).
        </p>

        <div className="flex gap-3 pt-4">
          <Link
            href="/listings"
            className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Browse listings
          </Link>

          <Link
            href="/sell"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Create a listing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold">Auctions with anti-sniping</h3>
          <p className="mt-1 text-sm text-neutral-700">
            Bids placed near the end extend the timer to keep things fair.
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold">Watchlist and messaging</h3>
          <p className="mt-1 text-sm text-neutral-700">
            Track listings you care about and chat directly with buyers and sellers.
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold">Moderation-ready</h3>
          <p className="mt-1 text-sm text-neutral-700">
            Reporting tools and an admin dashboard help keep the marketplace trustworthy.
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold">Australian focused</h3>
          <p className="mt-1 text-sm text-neutral-700">
            Categories, locations, and flows designed specifically for Australia.
          </p>
        </Card>
      </section>
    </div>
  );
}
