import Link from "next/link";
import { Card } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">bidra.com.au</div>
        <h1 className="mt-2 text-3xl font-bold">Buy, sell, and bid ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â built for Australia.</h1>
        <p className="mt-3 text-neutral-700 max-w-2xl">
          Bidra is a modern marketplace with auctions and buy-now listings. Watch favourites, message sellers,
          and complete purchases via secure checkout (Stripe test mode in MVP).
        </p>
        <div className="mt-5 flex gap-3">
          <Link href="/listings" className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90">
            Browse listings
          </Link>
          <Link href="/sell" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">
            Create a listing
          </Link>
        </div>
        <div className="mt-4 text-xs text-neutral-600">
          Safety first: read our <Link className="underline" href="/legal/safety">Safety tips</Link> and
          <Link className="underline ml-1" href="/legal/prohibited">Prohibited items policy</Link>.
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <Card>
          <div className="font-semibold">Auctions with anti-sniping</div>
          <p className="mt-2 text-sm text-neutral-700">
            Bids placed near the end extend the timer by 2 minutes to keep things fair.
          </p>
        </Card>
        <Card>
          <div className="font-semibold">Watchlist & messaging</div>
          <p className="mt-2 text-sm text-neutral-700">
            Track listings you care about and chat directly with buyers/sellers per listing.
          </p>
        </Card>
        <Card>
          <div className="font-semibold">Moderation-ready</div>
          <p className="mt-2 text-sm text-neutral-700">
            Reporting tools and an admin dashboard help keep the marketplace trustworthy.
          </p>
        </Card>
      </section>
    </div>
  );
}
