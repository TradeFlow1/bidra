import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Badge } from "@/components/ui";
import { labelCategory } from "@/lib/labels";
import DateTimeText from "@/components/date-time-text";
import { formatAud } from "@/lib/money";

type AdminListingRow = {
  id: string;
  title: string;
  category: string;
  location: string;
  type: string;
  status: string;
  price: number;
  createdAt: Date;
};

export default async function AdminListings() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const listings = (await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      title: true,
      category: true,
      location: true,
      type: true,
      status: true,
      price: true,
      createdAt: true,
    },
  })) as AdminListingRow[];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold">Listings</h1>
        <p className="mt-2 text-sm text-neutral-600">Review listing state, price, category, location, age, and report context before taking moderation action.</p>
      </div>

      <div className="grid gap-3">
        {listings.length === 0 ? (
          <Card>
            <div className="p-4 text-sm text-neutral-600">No listings need trust-operations review right now.</div>
          </Card>
        ) : null}

        {listings.map((l: AdminListingRow) => (
          <Card key={l.id}>
            <div className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-neutral-600 truncate">
                    {labelCategory(l.category)} • {l.location}
                  </div>

                  <Link
                    className="mt-1 block font-semibold hover:underline truncate"
                    href={"/listings/" + l.id}
                    title={l.title}
                  >
                    {l.title}
                  </Link>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge>{l.type}</Badge>
                    <Badge>{l.status}</Badge>
                    <Badge>{formatAud(l.price)}</Badge>
                  </div>
                </div>

                <div className="text-xs text-neutral-600 whitespace-nowrap sm:pt-1">
                  Created <DateTimeText value={l.createdAt} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}