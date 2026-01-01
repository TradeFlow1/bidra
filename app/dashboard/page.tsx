import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DeleteListingButton from "./delete-listing-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN";
if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const myListings = await prisma.listing.findMany({
    where: { sellerId: session.user.id, status: { not: "DELETED" } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        
{isAdmin ? (
  <Link href="/admin" className="rounded-md border px-3 py-2 text-sm font-medium hover:opacity-90">Admin</Link>
) : null}
<Link
          href="/sell/new"
          className="rounded-md border px-3 py-2 text-sm font-medium"
        >
          Create listing
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
  <h2 className="text-xl font-semibold">My listings</h2>
  <Link href="/dashboard/listings" className="text-sm font-medium underline underline-offset-4">
    View all
  </Link>
</div>

      {myListings.length === 0 ? (
        <p className="mt-3 text-sm opacity-70">
          You haven&apos;t created any listings yet.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {myListings.map((l: any) => (
            <div key={l.id} className="rounded-lg border p-4">
              <Link href={`/listings/${l.id}`} className="block hover:opacity-90">
                <div className="text-lg font-semibold">{l.title}</div>
                <div className="mt-1 text-sm opacity-80">
                  ${Number(l.price || 0) / 100}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs">
  <span className="rounded-full border px-2 py-0.5 font-semibold">
    Status: {l.status}
  </span>
</div>
<div className="mt-2 text-xs opacity-70">
  Listing ID: {l.id}
</div>
              </Link>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/sell/edit/${l.id}`}
                  className="rounded-md border px-3 py-2 text-sm font-medium"
                >
                  Edit
                </Link>

                <DeleteListingButton id={l.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
