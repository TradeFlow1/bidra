import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DateTimeText from "@/components/date-time-text";

type AdminReportRow = {
  id: string;
  reason: string;
  resolved: boolean;
  listingId: string;
  createdAt: Date;
  listing?: { id: string; title: string; status: string } | null;
  reporter?: { email: string } | null;
};

export default async function AdminReports({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const session = await auth();
  const user = session?.user;
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
      listing: { select: { id: true, title: true, status: true } },
      reporter: { select: { email: true } },
    },
  })) as AdminReportRow[];

  const btnStyle = (active: boolean) =>
    ({
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 8,
      textDecoration: "none",
      fontWeight: 900,
      fontSize: 13,
      border: "1px solid #ddd",
      color: active ? "#111" : "#1DA1F2",
      background: active ? "#f3f3f3" : "#fff",
    } as const);

  const badgeStyle: React.CSSProperties = {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 900,
    border: "1px solid #ddd",
    borderRadius: 999,
    padding: "2px 8px",
    color: "#111",
    background: "#fff",
  };

  const pill: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 900,
    border: "1px solid #ddd",
    borderRadius: 999,
    padding: "3px 8px",
    display: "inline-block",
  };

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
            Open <span style={badgeStyle}>{openCount}</span>
          </Link>
          <Link href="/admin/reports?status=resolved" style={btnStyle(showResolved)}>
            Resolved <span style={badgeStyle}>{resolvedCount}</span>
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {reports.length === 0 ? (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 900 }}>No reports found</div>
            <div style={{ color: "#666", marginTop: 6 }}>
              {showResolved ? "There are no resolved reports yet." : "There are no open reports right now."}
            </div>
          </div>
        ) : (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
            {reports.map((r, idx) => (
              <div key={r.id} style={{ borderTop: idx === 0 ? "none" : "1px solid #eee", padding: 12 }}>
                <div style={{ color: "#666", fontSize: 13 }}>
                  Report {" – "} <DateTimeText value={r.createdAt} />
                </div>

                <div style={{ marginTop: 6, fontWeight: 900, fontSize: 16 }}>
                  <Link href={"/admin/reports/" + r.id} style={{ color: "#1DA1F2", textDecoration: "none" }}>
                    {r.listing?.title ? r.listing.title : `Listing ${r.listingId}`}
                  </Link>
                </div>

                <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={pill}>{r.resolved ? "RESOLVED" : "OPEN"}</span>
                  <span style={pill}>Reason: {r.reason}</span>
                  <span style={pill}>Listing: {r.listing?.status ? String(r.listing.status) : "UNKNOWN"}</span>
                  <span style={pill}>Reporter: {r.reporter?.email ? r.reporter.email : "Unknown"}</span>

                  <Link
                    href={"/listings/" + r.listingId + "?returnTo=" + encodeURIComponent("/admin/reports/" + r.id)}
                    style={{ fontSize: 13, color: "#1DA1F2", textDecoration: "none", fontWeight: 800 }}
                  >
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
