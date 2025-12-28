import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function fmt(dt: Date | string | null | undefined) {
  if (!dt) return "";
  const d = typeof dt === "string" ? new Date(dt) : dt;
  return d.toLocaleString();
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams?: { type?: string; q?: string };
}) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const type = (searchParams?.type || "").toUpperCase().trim();
  const q = (searchParams?.q || "").trim();

  const where: any = {};
  if (type === "REPORT" || type === "LISTING" || type === "USER") where.entityType = type;

  if (q) {
    where.OR = [
      { action: { contains: q, mode: "insensitive" } },
      { entityId: { contains: q, mode: "insensitive" } },
      { reportId: { contains: q, mode: "insensitive" } },
      { listingId: { contains: q, mode: "insensitive" } },
      { userId: { contains: q, mode: "insensitive" } },
      { adminId: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.adminActionLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      createdAt: true,
      adminId: true,
      action: true,
      entityType: true,
      entityId: true,
      reportId: true,
      listingId: true,
      userId: true,
      meta: true,
    },
  });

  const card: React.CSSProperties = { border: "1px solid #e5e5e5", borderRadius: 12, padding: 14, marginTop: 14 };
  const pill: React.CSSProperties = { fontSize: 12, fontWeight: 800, border: "1px solid #ddd", borderRadius: 999, padding: "3px 8px", display: "inline-block" };

  const qp = (k: string, v: string) => {
    const sp = new URLSearchParams();
    if (type) sp.set("type", type);
    if (q) sp.set("q", q);
    sp.set(k, v);
    return "/admin/audit?" + sp.toString();
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>Admin audit log</h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>Latest 200 actions (filterable)</div>
        </div>
        <Link href="/admin" style={{ textDecoration: "none", fontWeight: 900 }}>← Back to Admin</Link>
      </div>

      <div style={card}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={pill}>Type: {type || "ALL"}</span>
          <span style={pill}>Query: {q || "—"}</span>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/admin/audit" style={{ fontWeight: 900, textDecoration: "none" }}>All</Link>
            <Link href={qp("type", "REPORT")} style={{ fontWeight: 900, textDecoration: "none" }}>Reports</Link>
            <Link href={qp("type", "LISTING")} style={{ fontWeight: 900, textDecoration: "none" }}>Listings</Link>
            <Link href={qp("type", "USER")} style={{ fontWeight: 900, textDecoration: "none" }}>Users</Link>
          </div>
        </div>

        <form method="get" action="/admin/audit" style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input type="hidden" name="type" value={type || ""} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search action / IDs (reportId, listingId, userId, entityId)"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", minWidth: 360 }}
          />
          <button type="submit" style={{ padding: "10px 12px", borderRadius: 10, fontWeight: 900, border: "1px solid #ddd", cursor: "pointer" }}>
            Search
          </button>
        </form>
      </div>

      <div style={card}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>When</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Action</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Type</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Entity</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Links</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Meta</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const links: any[] = [];
                if (r.reportId) links.push(<Link key="rep" href={"/admin/reports/" + r.reportId} style={{ fontWeight: 900, textDecoration: "none" }}>Report</Link>);
                if (r.listingId) links.push(<Link key="lst" href={"/listings/" + r.listingId} style={{ fontWeight: 900, textDecoration: "none" }}>Listing</Link>);
                if (r.userId) links.push(<Link key="usr" href={"/seller/" + r.userId} style={{ fontWeight: 900, textDecoration: "none" }}>User</Link>);
                return (
                  <tr key={r.id}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3", whiteSpace: "nowrap" }}>{fmt(r.createdAt)}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      <div style={{ fontWeight: 900 }}>{r.action}</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>admin: {r.adminId}</div>
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>{r.entityType}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      <div style={{ fontFamily: "monospace" }}>{r.entityId}</div>
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{links.length ? links : <span style={{ opacity: 0.6 }}>—</span>}</div>
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3", maxWidth: 420 }}>
                      <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {r.meta ? JSON.stringify(r.meta) : "—"}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!rows.length ? (
                <tr>
                  <td colSpan={6} style={{ padding: 14, opacity: 0.8 }}>
                    No audit log rows found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
