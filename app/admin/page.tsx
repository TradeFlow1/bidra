import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Badge } from "@/components/ui";

export default async function AdminHome() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const [users, listings, activeAuctions, reports] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { type: "AUCTION", status: "ACTIVE" } }),
    prisma.report.count({ where: { resolved: false } })
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="mt-1 text-sm text-neutral-700">Marketplace moderation and metrics.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">Users</Link>
          <Link href="/admin/listings" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">Listings</Link>
          <Link href="/admin/reports" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">Reports</Link>
<Link href="/admin/audit" style={{ textDecoration: "none", fontWeight: 900 }}>Audit log</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-neutral-600">Users</div>
          <div className="text-2xl font-bold">{users}</div>
        </Card>
        <Card>
          <div className="text-sm text-neutral-600">Listings</div>
          <div className="text-2xl font-bold">{listings}</div>
        </Card>
        <Card>
          <div className="text-sm text-neutral-600">Active auctions</div>
          <div className="text-2xl font-bold">{activeAuctions}</div>
        </Card>
        <Card>
          <div className="text-sm text-neutral-600">Open reports</div>
          <div className="text-2xl font-bold">{reports}</div>
          {reports ? <Badge className="mt-2">Needs review</Badge> : <Badge className="mt-2">All clear</Badge>}
        </Card>
      </div>
    </div>
  );
}
