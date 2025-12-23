import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, Button, Input, Textarea } from "@/components/ui";

const CATEGORIES = ["Vehicles","Property","Electronics","Home & Garden","Jobs","Services","Fashion","Sports","Collectibles","Pets"] as const;
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

      <Card className="p-4">
        <form className="space-y-4" action="/api/listings/create" method="post">
          <div>
            <label className="text-sm">Title</label>
            <Input name="title" placeholder="e.g. iPhone 14 Pro 256GB" required />
          </div>

          <div>
            <label className="text-sm">Description</label>
            <Textarea
              name="description"
              placeholder="Condition, included items, pickup/shipping, faults."
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm">Category</label>
              <select name="category" defaultValue="Electronics" className="w-full rounded-md border px-3 py-2 text-sm" required>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm">Listing type</label>
              <select name="type" defaultValue="BUY_NOW" className="w-full rounded-md border px-3 py-2 text-sm" required>
                <option value="BUY_NOW">Buy now</option>
                <option value="AUCTION">Auction</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm">State/Territory</label>
              <select name="location" defaultValue="NSW" className="w-full rounded-md border px-3 py-2 text-sm" required>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm">Condition</label>
              <select name="condition" defaultValue="Used - Good" className="w-full rounded-md border px-3 py-2 text-sm" required>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm">Price (AUD)</label>
            <Input name="price" placeholder="e.g. 129.99" inputMode="decimal" required />
          </div>

          <Button type="submit" className="bg-black text-white border-black hover:opacity-90">
            Create listing
          </Button>

          <p className="text-xs text-neutral-600">
            This form posts to <code>/api/listings/create</code>.
          </p>
        </form>
      </Card>
    </div>
  );
}
