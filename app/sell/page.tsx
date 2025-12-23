import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, Input, Textarea } from "@/components/ui";

const CATEGORIES = ["Electronics","Vehicles","Home","Fashion"] as const;
const STATES = ["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"] as const;
const CONDITIONS = ["New","Used - Like New","Used - Good","Used - Fair"] as const;

export default async function SellPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">Create a listing</h1>

      <Card>
        <form method="post" action="/api/listings/create" className="space-y-4">

          <Input name="title" placeholder="Title" required />
          <Textarea name="description" placeholder="Description" required />

          <select name="category" required>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select name="type" defaultValue="BUY_NOW">
            <option value="BUY_NOW">Buy now</option>
            <option value="AUCTION">Auction</option>
          </select>

          <select name="location">
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select name="condition">
            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <Input name="price" placeholder="Price (AUD)" required />

          <button type="submit" className="bg-black text-white px-4 py-2">
            Create listing
          </button>
        </form>
      </Card>
    </div>
  );
}
