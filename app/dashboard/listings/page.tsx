import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Button, Badge } from "@/components/ui";

export default async function MyListingsPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");

  const listings = await prisma.listing.findMany({
    where: { sellerId: user.id, status: { not: "DELETED" } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  async function updateStatus(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const u = s?.user as any;
    if (!u) redirect("/auth/login");

    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.sellerId !== u.id) throw new Error("Not allowed");

    const allowed = ["DRAFT", "ACTIVE", "ENDED"];
    if (!allowed.includes(status)) throw new Error("Invalid status");

    await prisma.listing.update({
      where: { id },
      data: { status: status as any },
    });

    redirect("/dashboard/listings");
  }

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bd-ink">My listings</h1>
              <p className="mt-1 text-sm bd-ink2">Manage status and view listing activity.</p>
            </div>
            <Link href="/sell/new" className="bd-btn bd-btn-primary text-center">
              Create new
            </Link>
          </div>

          <div className="grid gap-3">
            {listings.map((l: any) => (
              <Card
                key={l.id}
                className="bd-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm bd-ink2">
                    {l.category} • {l.location}
                  </div>

                  <Link
                    className="bd-ink font-extrabold hover:underline underline-offset-4"
                    href={"/listings/" + l.id}
                  >
                    {l.title}
                  </Link>

                  <div className="mt-2 flex gap-2 flex-wrap">
                    <Badge>{l.type === "AUCTION" ? "Offers" : "Buy now"}</Badge>
                    <Badge>Status: {l.status}</Badge>
                  </div>

                  <div className="mt-1 text-sm font-extrabold bd-ink">
                    ${(l.price / 100).toFixed(2)} AUD
                  </div>
                </div>

                <form action={updateStatus} className="flex items-center gap-2 flex-wrap">
                  <input type="hidden" name="id" value={l.id} />

                  <select
                    name="status"
                    defaultValue={l.status}
                    disabled={l.status === "SUSPENDED" || l.status === "DELETED"}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    {["DRAFT", "ACTIVE", "SUSPENDED", "ENDED", "SOLD"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <Button type="submit" className="bd-btn bd-btn-primary text-center">
                    Update
                  </Button>

                  {l.status === "SUSPENDED" || l.status === "DELETED" ? (
                    <div className="text-xs bd-ink2">Policy-locked (admin action)</div>
                  ) : null}
                </form>
              </Card>
            ))}

            {!listings.length ? (
              <div className="text-sm bd-ink2">No listings yet. Create one to start selling.</div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
