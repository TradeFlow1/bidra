import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Badge } from "@/components/ui";

export default async function AdminListings() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">Listings</h1>
      <div className="grid gap-3">
        {listings.map(l => (
          <Card key={l.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-neutral-600">{l.category} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ {l.location}</div>
                <Link className="font-semibold hover:underline" href={"/listing/" + l.id}>{l.title}</Link>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <Badge>{l.type}</Badge>
                  <Badge>{l.status}</Badge>
                  <Badge>${(l.price/100).toFixed(2)}</Badge>
                </div>
              </div>
              <div className="text-xs text-neutral-600">Created {new Date(l.createdAt).toLocaleString("en-AU")}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
