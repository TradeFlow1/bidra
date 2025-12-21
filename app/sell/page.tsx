import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Button, Input, Textarea } from "@/components/ui";

const CATEGORIES = ["Vehicles","Property","Electronics","Home & Garden","Jobs","Services","Fashion","Sports","Collectibles","Pets"] as const;
const STATES = ["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"] as const;
const CONDITIONS = ["New","Used - Like New","Used - Good","Used - Fair","For parts"] as const;

export default async function SellPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");

  async function create(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const session = await auth();
    const user = session?.user as any;
    if (!user) redirect("/auth/login");

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "");
    const type = String(formData.get("type") ?? "BUY_NOW");
    const location = String(formData.get("location") ?? "");
    const condition = String(formData.get("condition") ?? "Used - Good");

    const priceDollars = Number(formData.get("price") ?? "0");
    const price = Math.max(0, Math.round(priceDollars * 100));

    if (!title || !description || !category || !type || !location || !condition) {
      throw new Error("Missing required fields");
    }

    let endsAt: Date | null = null;
    if (type === "AUCTION") {
      // MVP default: 24 hours
      endsAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    }

    await prisma.listing.create({
      data: {
        title,
        description,
        category,
        type: type as any,
        status: "ACTIVE",
        condition,
        price,
        images: [],
        location,
        endsAt,
        sellerId: user.id
      }
    });

    redirect("/dashboard/listings");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Create listing</h1>
      <p className="mt-1 text-sm text-neutral-700">
        Auctions default to a 24-hour duration in MVP. Add photos later (MVP stores image paths/URLs).
      </p>

      <Card className="mt-4">
        <form action={create} className="flex flex-col gap-3">
          <label className="text-sm">Title</label>
          <Input name="title" placeholder="e.g. iPhone 14 Pro 256GB" required />

          <label className="text-sm">Description</label>
          <Textarea name="description" placeholder="Write clear details: condition, included items, pickup/shipping." required />

          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm">Listing type</label>
              <select name="type" defaultValue="BUY_NOW" className="rounded-md border px-3 py-2 text-sm">
                <option value="BUY_NOW">Buy now</option>
                <option value="AUCTION">Auction</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm">Condition</label>
              <select name="condition" defaultValue="Used - Good" className="rounded-md border px-3 py-2 text-sm">
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm">Category</label>
              <select name="category" defaultValue="Electronics" className="rounded-md border px-3 py-2 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm">State/Territory</label>
              <select name="location" defaultValue="NSW" className="rounded-md border px-3 py-2 text-sm">
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <label className="text-sm">Price (AUD)</label>
          <Input name="price" inputMode="decimal" placeholder="e.g. 1299.00" required />

          <Button type="submit" className="bg-black text-white border-black hover:opacity-90">Publish</Button>
        </form>
      </Card>
    </div>
  );
}
