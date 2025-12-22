import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toIntCents(v: FormDataEntryValue | null) {
  const n = Number(String(v ?? "").trim());
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.round(n * 100));
}

export default async function SellPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  async function createListing(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user?.email) redirect("/auth/login");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) redirect("/auth/login");

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const type = String(formData.get("type") ?? "BUY_NOW").trim();
    const condition = String(formData.get("condition") ?? "USED").trim();
    const priceCents = toIntCents(formData.get("price"));

    if (!title || !description || !category || !location || !priceCents) {
      // simple fallback: reload page if invalid
      redirect("/sell");
    }

    const now = new Date();

    // If AUCTION, default to 7 days from now
    const endsAt =
      type === "AUCTION"
        ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        : null;

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        category,
        location,
        type: type === "AUCTION" ? "AUCTION" : "BUY_NOW",
        condition,
        price: priceCents,
        endsAt,
        status: "ACTIVE",
        sellerId: user.id,
      } as any,
      select: { id: true },
    });

    redirect(`/listing/${listing.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Create a listing</h1>

      <form action={createListing} className="space-y-4">
        <div>
          <label className="text-sm">Title</label>
          <input
            name="title"
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. iPhone 14 Pro"
            required
          />
        </div>

        <div>
          <label className="text-sm">Description</label>
          <textarea
            name="description"
            className="w-full border rounded px-3 py-2"
            rows={5}
            placeholder="Describe your item..."
            required
          />
        </div>

        <div>
          <label className="text-sm">Category</label>
          <select name="category" className="w-full border rounded px-3 py-2" required>
            <option value="">Select...</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Property">Property</option>
            <option value="Electronics">Electronics</option>
            <option value="Home & Garden">Home & Garden</option>
            <option value="Jobs">Jobs</option>
            <option value="Services">Services</option>
            <option value="Fashion">Fashion</option>
            <option value="Sports">Sports</option>
            <option value="Collectibles">Collectibles</option>
            <option value="Pets">Pets</option>
          </select>
        </div>

        <div>
          <label className="text-sm">State</label>
          <select name="location" className="w-full border rounded px-3 py-2" required>
            <option value="">Select...</option>
            <option value="NSW">NSW</option>
            <option value="VIC">VIC</option>
            <option value="QLD">QLD</option>
            <option value="WA">WA</option>
            <option value="SA">SA</option>
            <option value="TAS">TAS</option>
            <option value="ACT">ACT</option>
            <option value="NT">NT</option>
          </select>
        </div>

        <div>
          <label className="text-sm">Type</label>
          <select name="type" className="w-full border rounded px-3 py-2">
            <option value="BUY_NOW">Buy now</option>
            <option value="AUCTION">Auction</option>
          </select>
        </div>

        <div>
          <label className="text-sm">Condition</label>
          <select name="condition" className="w-full border rounded px-3 py-2">
            <option value="NEW">New</option>
            <option value="USED">Used</option>
            <option value="REFURBISHED">Refurbished</option>
          </select>
        </div>

        <div>
          <label className="text-sm">Price (AUD)</label>
          <input
            name="price"
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 199.99"
            inputMode="decimal"
            required
          />
        </div>

        <button className="rounded bg-black text-white px-4 py-2" type="submit">
          Publish listing
        </button>
      </form>
    </div>
  );
}
