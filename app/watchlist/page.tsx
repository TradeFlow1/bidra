import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Button } from "@/components/ui";

export default async function WatchlistPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");

  async function remove(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const u = s?.user as any;
    if (!u) redirect("/auth/login");

    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const item = await prisma.watchlist.findUnique({ where: { id } });
    if (!item || item.userId !== u.id) return;

    await prisma.watchlist.delete({ where: { id } });
  }

  const items = await prisma.watchlist.findMany({
    where: { userId: user.id },
    include: { listing: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Watchlist</h1>
          <p className="mt-1 text-sm text-neutral-700">Quick access to listings youÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢re tracking.</p>
        </div>
        <Link href="/listings" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">Browse</Link>
      </div>

      <div className="grid gap-3">
        {items.map(w => (
          <Card key={w.id} className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-neutral-600">{w.listing.category} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ {w.listing.location}</div>
              <Link className="font-semibold hover:underline" href={"/listing/" + w.listingId}>{w.listing.title}</Link>
              <div className="mt-1 text-sm font-bold">${(w.listing.price/100).toFixed(2)} AUD</div>
            </div>
            <form action={remove}>
              <input type="hidden" name="id" value={w.id} />
              <Button type="submit">Remove</Button>
            </form>
          </Card>
        ))}
      </div>

      {!items.length ? <div className="text-sm text-neutral-600">No watched listings.</div> : null}
    </div>
  );
}
