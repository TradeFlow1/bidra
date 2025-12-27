import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      reporter: { select: { email: true } },
      listingId: true,
      listing: { select: { id: true, title: true, status: true, sellerId: true } },
    },
  });

  if (!report) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Report not found</h1>
        <div style={{ marginTop: 10 }}>
          <Link href="/admin/reports" style={{ color: "#1DA1F2", textDecoration: "none", fontWeight: 800 }}>
            Back to reports
          </Link>
        </div>
      </div>
    );
  }

  // Load seller enforcement state (so admin can strike/block quickly)
  const sellerId = report.listing?.sellerId || "";
  const seller = sellerId
    ? await prisma.user.findUnique({
        where: { id: sellerId },
        select: { id: true, email: true, policyStrikes: true, policyBlockedUntil: true },
      })
    : null;

  const listingStatus = report.listing?.status || "UNKNOWN";
  const canSuspend = listingStatus !== "SUSPENDED";
  const canUnsuspend = listingStatus === "SUSPENDED";

  const pillStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 900,
    border: "1px solid #ddd",
    borderRadius: 999,
    padding: "3px 8px",
    display: "inline-block",
  };

  const btnStyle = (primary: boolean): React.CSSProperties => ({
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 13,
    border: "1px solid #ddd",
    color: primary ? "#111" : "#1DA1F2",
    background: primary ? "#f3f3f3" : "#fff",
    cursor: "pointer",
  });

  const returnTo = encodeURIComponent(`/admin/reports/${report.id}`);
  const listingHref = `/listings/${report.listingId}?returnTo=${returnTo}`;

  const blocked = seller?.policyBlockedUntil ? new Date(seller.policyBlockedUntil) : null;
  const isBlocked = blocked ? blocked.getTime() > Date.now() : false;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 34, margin: 0 }}>Report</h1>
          <div style={{ color: "#666", marginTop: 6 }}>
            Created {" • "} {new Date(report.createdAt).toLocaleString("en-AU")}
          </div>
        </div>

        <Link href="/admin/reports" style={{ color: "#1DA1F2", textDecoration: "none", fontWeight: 900 }}>
          Back
        </Link>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={pillStyle}>{report.resolved ? "RESOLVED" : "OPEN"}</span>
          <span style={pillStyle}>{report.reason}</span>
          <span style={pillStyle}>LISTING: {listingStatus}</span>
          {seller ? <span style={pillStyle}>SELLER STRIKES: {seller.policyStrikes}</span> : null}
          {seller ? <span style={pillStyle}>{isBlocked ? `BLOCKED until ${blocked!.toLocaleString("en-AU")}` : "NOT BLOCKED"}</span> : null}
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Listing</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link href={listingHref} style={{ color: "#1DA1F2", textDecoration: "none", fontWeight: 900, fontSize: 16 }}>
              {report.listing?.title ? report.listing.title : report.listingId}
            </Link>
            <Link href={listingHref} style={{ color: "#1DA1F2", textDecoration: "none", fontSize: 13 }}>
              View listing
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Reporter</div>
          <div style={{ color: "#444", fontSize: 13 }}>{report.reporter?.email ?? "(unknown email)"} — {report.reporterId}</div>
        </div>

        {seller ? (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Seller</div>
            <div style={{ color: "#444", fontSize: 13 }}>{seller.email ?? "(unknown email)"} — {seller.id}</div>

            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <form action="/api/admin/users/strike" method="post">
                <input type="hidden" name="userId" value={seller.id} />
                <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                <button style={btnStyle(false)} type="submit">Strike user</button>
              </form>

              <form action="/api/admin/users/block" method="post">
                <input type="hidden" name="userId" value={seller.id} />
                <input type="hidden" name="days" value="1" />
                <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                <button style={btnStyle(false)} type="submit">Block 24h</button>
              </form>

              <form action="/api/admin/users/block" method="post">
                <input type="hidden" name="userId" value={seller.id} />
                <input type="hidden" name="days" value="7" />
                <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                <button style={btnStyle(false)} type="submit">Block 7d</button>
              </form>

              <form action="/api/admin/users/block" method="post">
                <input type="hidden" name="userId" value={seller.id} />
                <input type="hidden" name="days" value="30" />
                <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                <button style={btnStyle(false)} type="submit">Block 30d</button>
              </form>
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Details</div>
          <div style={{ color: "#444", fontSize: 14, whiteSpace: "pre-wrap" }}>
            {report.details ? report.details : "(none)"}
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <form action="/api/admin/reports/resolve" method="post">
            <input type="hidden" name="id" value={report.id} />
            <input type="hidden" name="resolved" value={report.resolved ? "false" : "true"} />
            <button style={btnStyle(true)} type="submit">
              {report.resolved ? "Mark as Open" : "Mark as Resolved"}
            </button>
          </form>

          <form action="/api/admin/listings/set-status" method="post">
            <input type="hidden" name="listingId" value={report.listingId} />
            <input type="hidden" name="status" value="SUSPENDED" />
            <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
            <button style={btnStyle(false)} type="submit" disabled={!canSuspend}>
              Suspend listing
            </button>
          </form>

          <form action="/api/admin/listings/set-status" method="post">
            <input type="hidden" name="listingId" value={report.listingId} />
            <input type="hidden" name="status" value="ACTIVE" />
            <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
            <button style={btnStyle(false)} type="submit" disabled={!canUnsuspend}>
              Unsuspend listing
            </button>
          </form>
        </div>

        <div style={{ marginTop: 10, color: "#666", fontSize: 12 }}>
          Tip: Strike/block should be used for repeated policy breaches. Strike threshold auto-blocks and suspends ACTIVE listings.
        </div>
      </div>
    </div>
  );
}