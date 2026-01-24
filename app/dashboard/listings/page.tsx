import { labelCategory } from "@/lib/labels";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Button, Badge } from "@/components/ui";
import { isTimedOffersType } from "@/lib/listing-type";

type PageProps = {
  searchParams?: { err?: string };
};

const SELLER_ALLOWED_STATUSES = ["DRAFT", "ACTIVE", "ENDED"] as const;

function safeErr(s: unknown): string {
  const v = String(s ?? "").slice(0, 180);
  return encodeURIComponent(v);
}

export default async function MyListingsPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = (session?.user as any)?.id ? String((session?.user as any).id) : "";
  if (!userId) redirect("/auth/login");

  const err = searchParams?.err ? decodeURIComponent(String(searchParams.err)) : "";

  const listings = await prisma.listing.findMany({
    where: { sellerId: userId, status: { not: "DELETED" } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  async function updateStatus(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const uid = (s?.user as any)?.id ? String((s?.user as any).id) : "";
    if (!uid) redirect("/auth/login");

    const safe = (m: string) => encodeURIComponent(String(m || "").slice(0, 180));

    const id = String(formData.get("id") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim();

    if (!id) redirect("/dashboard/listings?err=" + safe("Missing listing id"));
    if (!status) redirect("/dashboard/listings?err=" + safe("Missing status"));

    const SELLER_ALLOWED = ["DRAFT", "ACTIVE", "ENDED"];

    try {
      const listing = await prisma.listing.findUnique({
        where: { id },
        select: { id: true, sellerId: true },
      });

      if (!listing) { redirect("/dashboard/listings?err=" + safe("Listing not found")); return; }
      if (listing.sellerId !== uid) { redirect("/dashboard/listings?err=" + safe("Not allowed")); return; }

      if (!SELLER_ALLOWED.includes(status)) { redirect("/dashboard/listings?err=" + safe("Invalid status")); return; }

      await prisma.listing.update({
        where: { id },
        data: { status: status as any },
      });

      redirect("/dashboard/listings?ok=1");
    } catch (e: any) {
      console.error("dashboard/listings updateStatus failed:", e);
      redirect("/dashboard/listings?err=" + safe("Couldn't update"));
    }
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

          {err ? (
            <div className="bd-card p-4 border border-red-200 bg-red-50/50">
              <div className="text-sm font-extrabold bd-ink">Couldn’t update</div>
              <div className="mt-1 text-sm bd-ink2">{err}</div>
            </div>
          ) : null}

          <div className="grid gap-3">
            {listings.map((l: any) => (
              <Card
                key={l.id}
                className="bd-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm bd-ink2">
                    {labelCategory(l.category)} • {l.location}
                  </div>

                  <Link
                    className="bd-ink font-extrabold hover:underline underline-offset-4"
                    href={"/listings/" + l.id}
                  >
                    {l.title}
                  </Link>

                  <div className="mt-2 flex gap-2 flex-wrap">
                    <Badge>{isTimedOffersType(l.type) ? "Timed offers" : "Buy Now"}</Badge>
                    <Badge>Status: {l.status}</Badge>
                  </div>

                  <div className="mt-1 text-sm font-extrabold bd-ink">
                    ${(l.price / 100).toFixed(2)} AUD
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={"/listings/" + l.id} className="bd-btn bd-btn-ghost text-center">
                    View
                  </Link>
                  <Link href={"/sell/edit/" + l.id} className="bd-btn bd-btn-primary text-center">
                    Edit listing
                  </Link>
                </div>
              </Card>
            ))}

            {!listings.length ? (
              <div className="text-sm bd-ink2">No listings yet. Create a listing to start selling.</div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
