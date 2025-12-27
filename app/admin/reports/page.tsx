import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Badge } from "@/components/ui";

type AdminReportRow = {
  id: string;
  reason: string;
  resolved: boolean;
  listingId: string;
  createdAt: Date;
  listing?: { id: string; title: string } | null;
};

export default async function AdminReports() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const reports = (await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      reason: true,
      resolved: true,
      listingId: true,
      createdAt: true,
      listing: { select: { id: true, title: true } },
    },
  })) as AdminReportRow[];

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="grid gap-3">
        {reports.map((r: AdminReportRow) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-neutral-600">
                  Report {" • "} {new Date(r.createdAt).toLocaleString("en-AU")}
                </div>

                <div className="mt-1 font-semibold">
                  <Link className="hover:underline" href={"/admin/reports/" + r.id}>
                    {r.listing?.title ? r.listing.title : `Listing ${r.listingId}`}
                  </Link>
                </div>

                <div className="mt-2 flex gap-2 flex-wrap">
                  <Badge>{r.resolved ? "RESOLVED" : "OPEN"}</Badge>
                  <Badge>{r.reason}</Badge>
                </div>
              </div>

              <div className="text-xs text-neutral-600">
                <Link className="hover:underline" href={"/admin/reports/" + r.id}>
                  View
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}