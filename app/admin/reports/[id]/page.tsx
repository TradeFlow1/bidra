import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Badge, Button } from "@/components/ui";

export default async function AdminReportDetail({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      reason: true,
      details: true,
      resolved: true,
      createdAt: true,
      reporterId: true,
      listingId: true,
      listing: { select: { id: true, title: true } },
    },
  });

  if (!report) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Report not found</h1>
        <Link className="hover:underline" href="/admin/reports">Back to reports</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Report</h1>
          <div className="text-sm text-neutral-600">
            Created {" • "} {new Date(report.createdAt).toLocaleString("en-AU")}
          </div>
        </div>
        <Link className="hover:underline text-sm" href="/admin/reports">Back</Link>
      </div>

      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            <Badge>{report.resolved ? "RESOLVED" : "OPEN"}</Badge>
            <Badge>{report.reason}</Badge>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Listing</div>
            <Link className="hover:underline" href={"/listings/" + report.listingId}>
              {report.listing?.title ? report.listing.title : report.listingId}
            </Link>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Reporter ID</div>
            <div className="text-neutral-700">{report.reporterId}</div>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Details</div>
            <div className="text-neutral-700 whitespace-pre-wrap">
              {report.details ? report.details : "(none)"}
            </div>
          </div>

          <form action="/api/admin/reports/resolve" method="post" className="flex gap-2">
            <input type="hidden" name="id" value={report.id} />
            <input type="hidden" name="resolved" value={report.resolved ? "false" : "true"} />
            <Button type="submit">
              {report.resolved ? "Mark as Open" : "Mark as Resolved"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}