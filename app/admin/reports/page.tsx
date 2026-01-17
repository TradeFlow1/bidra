import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type AdminReportRow = {
  id: string;
  reason: string;
  resolved: boolean;
  listingId: string;
  createdAt: Date;
  listing?: { id: string; title: string } | null;
};

export default async function AdminReports({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const status = (searchParams?.status || "open").toLowerCase();
  const showResolved = status === "resolved";

  const [openCount, resolvedCount] = await Promise.all([
    prisma.report.count({ where: { resolved: false } }),
    prisma.report.count({ where: { resolved: true } }),
  ]);

  const reports = (await prisma.report.findMany({
    where: showResolved ? { resolved: true } : { resolved: false },
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
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

  const btnStyle = (active: boolean) =>
    ({
      display: "inline-block",
      padding: "8px 12px",
      borderRadius: 8,
      textDecoration: "none",
      fontWeight: 800,
      fontSize: 13,
      border: "1px solid #ddd",
      color: active ? "#111" : "#1DA1F2",
      background: active ? "#f3f3f3" : "#fff",
    } as const);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 34, margin: 0 }}>Reports</h1>
          <div style={{ color: "#666", marginTop: 6 }}>
            {showResolved ? "Showing resolved reports" : "Showing open reports"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/reports?status=open" style={btnStyle(!showResolved)}>
            Open
          </Link>
          <Link href="/admin/reports?status=resolved" style={btnStyle(showResolved)}>
            Resolved
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {reports.length === 0 ? (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 800 }}>No reports found</div>
            <div style={{ color: "#666", marginTop: 6 }}>
              {showResolved ? "There are no resolved reports yet." : "There are no open reports right now."}
            </div>
          </div>
        ) : (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
            {reports.map((r) => (
              <div key={r.id} style={{ borderTop: "1px solid #eee", padding: 12 }}>
                <div style={{ color: "#666", fontSize: 13 }}>
                  Report {" – "} {new Date(r.createdAt).toLocaleString("en-AU")}
                </div>

                <div style={{ marginTop: 6, fontWeight: 900, fontSize: 16 }}>
                  <Link href={"/admin/reports/" + r.id} style={{ color: "#1DA1F2", textDecoration: "none" }}>
                    {r.listing?.title ? r.listing.title : `Listing ${r.listingId}`}
                  </Link>
                </div>

                <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 900, border: "1px solid #ddd", borderRadius: 999, padding: "3px 8px" }}>
                    {r.resolved ? "RESOLVED" : "OPEN"}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 900, border: "1px solid #ddd", borderRadius: 999, padding: "3px 8px" }}>
                    {r.reason}
                  </span>
                  <Link href={"/listings/" + r.listingId + "?returnTo=" + encodeURIComponent("/admin/reports/" + r.id)} style={{ fontSize: 13, color: "#1DA1F2", textDecoration: "none" }}>
                    View listing
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
