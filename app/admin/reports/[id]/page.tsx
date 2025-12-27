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
      listing: {
        select: {
          id: true,
          title: true,
          status: true,
          sellerId: true,
          seller: { select: { id: true, policyStrikes: true, policyBlockedUntil: true } },
        },
      },
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

  const listingStatus = report.listing?.status || "UNKNOWN";
  const canSuspend = listingStatus !== "SUSPENDED";
  const canUnsuspend = listingStatus === "SUSPENDED";

  const sellerId = report.listing?.sellerId || "";
  const sellerStrikes = report.listing?.seller?.policyStrikes ?? null;
  const sellerBlockedUntil = report.listing?.seller?.policyBlockedUntil ?? null;

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
            <Badge>{`LISTING: ${listingStatus}`}</Badge>
            {sellerStrikes !== null ? <Badge>{`SELLER STRIKES: ${sellerStrikes}`}</Badge> : null}
            {sellerBlockedUntil ? (
              <Badge>{`BLOCKED UNTIL: ${new Date(sellerBlockedUntil).toLocaleDateString("en-AU")}`}</Badge>
            ) : null}
          </div>

          <div className="text-sm">
            <div className="font-semibold">Listing</div>
            <Link className="hover:underline" href={"/listings/" + report.listingId}>
              {report.listing?.title ? report.listing.title : report.listingId}
            </Link>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Seller ID</div>
            <div className="text-neutral-700">{sellerId || "(unknown)"}</div>
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

          <div className="flex flex-wrap gap-2">
            <form action="/api/admin/reports/resolve" method="post">
              <input type="hidden" name="id" value={report.id} />
              <input type="hidden" name="resolved" value={report.resolved ? "false" : "true"} />
              <Button type="submit">
                {report.resolved ? "Mark as Open" : "Mark as Resolved"}
              </Button>
            </form>

            <form action="/api/admin/listings/set-status" method="post">
              <input type="hidden" name="listingId" value={report.listingId} />
              <input type="hidden" name="status" value="SUSPENDED" />
              <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
              <Button type="submit" disabled={!canSuspend}>
                Suspend listing
              </Button>
            </form>

            <form action="/api/admin/listings/set-status" method="post">
              <input type="hidden" name="listingId" value={report.listingId} />
              <input type="hidden" name="status" value="ACTIVE" />
              <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
              <Button type="submit" disabled={!canUnsuspend}>
                Unsuspend listing
              </Button>
            </form>

            <form action="/api/admin/users/strike" method="post">
              <input type="hidden" name="userId" value={sellerId} />
              <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
              <Button type="submit" disabled={!sellerId}>
                Add strike to seller
              </Button>
            </form>
          </div>

          <div className="text-xs text-neutral-600">
            Strike rule: at 3 strikes → auto block 7 days + suspend all ACTIVE listings.
          </div>
        </div>
      </Card>
    </div>
  );
}