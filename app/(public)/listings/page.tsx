import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Input, Badge } from "@/components/ui";

const CATEGORIES = ["Vehicles","Property","Electronics","Home & Garden","Jobs","Services","Fashion","Sports","Collectibles","Pets"];
const STATES = ["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"];
const TYPES = ["AUCTION","BUY_NOW"];

function parseIntSafe(v: string | undefined) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function ListingsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const q = (searchParams.q ?? "").trim();
  const category = (searchParams.category ?? "").trim();
  const location = (searchParams.location ?? "").trim();
  const type = (searchParams.type ?? "").trim();
  const min = parseIntSafe(searchParams.min);
  const max = parseIntSafe(searchParams.max);
  const sort = (searchParams.sort ?? "new").trim();

  const where: any = { status: "ACTIVE" };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } }
    ];
  }
  if (category && CATEGORIES.includes(category)) where.category = category;
  if (location && STATES.includes(location)) where.location = location;
  if (type && TYPES.includes(type)) where.type = type;

  if (min !== undefined || max !== undefined) {
    where.price = {};
    if (min !== undefined) where.price.gte = Math.max(0, Math.round(min * 100));
    if (max !== undefined) where.price.lte = Math.max(0, Math.round(max * 100));
  }

  const orderBy =
    sort === "price_asc" ? { price: "asc" } :
    sort === "price_desc" ? { price: "desc" } :
    { createdAt: "desc" };

  const listings = await prisma.listing.findMany({
    where,
    orderBy,
    take: 60
  });

  const qs = new URLSearchParams(searchParams as any);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Browse listings</h1>
          <p className="mt-1 text-sm text-neutral-700">Search auctions and buy-now items across Australia.</p>
        </div>
        <Link href="/sell" className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90">Sell</Link>
      </div>

      <Card>
        <form className="grid md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm">Keyword</label>
            <Input name="q" defaultValue={q} placeholder="Search title or description" />
          </div>

          <div>
            <label className="text-sm">Category</label>
            <select name="category" defaultValue={category} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">All</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm">State</label>
            <select name="location" defaultValue={location} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">All</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm">Type</label>
            <select name="type" defaultValue={type} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="BUY_NOW">Buy now</option>
              <option value="AUCTION">Auction</option>
            </select>
          </div>

          <div>
            <label className="text-sm">Sort</label>
            <select name="sort" defaultValue={sort} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="new">Newest</option>
              <option value="price_asc">Price (low ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ high)</option>
              <option value="price_desc">Price (high ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ low)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm">Min (AUD)</label>
            <Input name="min" defaultValue={searchParams.min ?? ""} placeholder="0" inputMode="decimal" />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm">Max (AUD)</label>
            <Input name="max" defaultValue={searchParams.max ?? ""} placeholder="2000" inputMode="decimal" />
          </div>

          <div className="md:col-span-2 flex items-end gap-2">
            <button className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90" type="submit">
              Apply
            </button>
            <Link className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50" href="/listings">
              Reset
            </Link>
          </div>
        </form>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map(l => (
          <Link key={l.id} href={"/listing/" + l.id} className="group">
            <Card className="h-full hover:shadow-md transition-shadow">
              <div className="text-sm text-neutral-600">{l.category} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ {l.location}</div>
              <div className="mt-1 font-semibold group-hover:underline">{l.title}</div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Badge>{l.type === "AUCTION" ? "Auction" : "Buy now"}</Badge>
                <Badge>{l.condition}</Badge>
              </div>
              <div className="mt-3 text-sm font-bold">${(l.price / 100).toFixed(2)} AUD</div>
              {l.type === "AUCTION" && l.endsAt ? (
                <div className="mt-1 text-xs text-neutral-600">Ends {new Date(l.endsAt).toLocaleString("en-AU")}</div>
              ) : null}
            </Card>
          </Link>
        ))}
      </div>

      {!listings.length ? <div className="text-sm text-neutral-600">No listings match those filters.</div> : null}
    </div>
  );
}
