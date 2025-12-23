import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, Input, Textarea } from "@/components/ui";

const CATEGORIES = [
  "Vehicles",
  "Property",
  "Electronics",
  "Home & Garden",
  "Jobs",
  "Services",
  "Fashion",
  "Sports",
  "Collectibles",
  "Pets",
] as const;

const STATES = ["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"] as const;

const CONDITIONS = ["New","Used - Like New","Used - Good","Used - Fair","For parts"] as const;

export default async function SellPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Create a listing</h1>
        <Link className="text-sm underline" href="/listings">
          Back to listings
        </Link>
      </div>

      <Card>
        <form className="space-y-4" action="/api/listings/create" method="post">
          <div>
            <label className="text-sm">Title</label>
            <Input name="title" placeholder="e.g. Makita Drill" required />
          </div>

          <div>
            <label className="text-sm">Description</label>
            <Textarea
              name="description"
              placeholder="Condition, what’s included, pickup/shipping, etc."
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm">Category</label>
              <select
                name="category"
                defaultValue="Electronics"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm">Listing type</label>
              <select
                name="type"
                defaultValue="BUY_NOW"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                required
              >
                <option value="BUY_NOW">Buy now</option>
                <option value="AUCTION">Auction</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm">State/Territory</label>
              <select
                name="location"
                defaultValue="VIC"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                required
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm">Condition</label>
              <select
                name="condition"
                defaultValue="Used - Good"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                required
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm">Price (AUD)</label>
            <Input name="price" placeholder="e.g. 85" inputMode="decimal" required />
          </div>

          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Create listing
          </button>
        </form>
      </Card>
    </div>
  );
}
