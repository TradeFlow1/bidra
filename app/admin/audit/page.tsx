import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DateTimeText from "@/components/date-time-text";

function fmt(dt: Date | string | null | undefined) {
  if (!dt) return "";
  const d = typeof dt === "string" ? new Date(dt) : dt;
  return <DateTimeText value={d} />;
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams?: { type?: string; q?: string };
}) {
  const session = await auth();
  const user = session?.user;
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

  const tabBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #e5e5e5",
    fontWeight: 900,
    textDecoration: "none",
    lineHeight: 1,
    background: "#fff",
  };

  const tabActive: React.CSSProperties = {
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
  };
  const chip: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e5e5",
    fontWeight: 900,
    textDecoration: "none",
    lineHeight: 1,
    background: "#fff",
  };

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
            <Link
              href="/admin/audit"
              style={Object.assign({}, tabBase, (!type ? tabActive : null))}
              aria-current={!type ? "page" : undefined}
            >
              All
            </Link>
            <Link
              href={qp("type", "REPORT")}
              style={Object.assign({}, tabBase, (type === "REPORT" ? tabActive : null))}
              aria-current={type === "REPORT" ? "page" : undefined}
            >
              Reports
            </Link>
            <Link
              href={qp("type", "LISTING")}
              style={Object.assign({}, tabBase, (type === "LISTING" ? tabActive : null))}
              aria-current={type === "LISTING" ? "page" : undefined}
            >
              Listings
            </Link>
            <Link
              href={qp("type", "USER")}
              style={Object.assign({}, tabBase, (type === "USER" ? tabActive : null))}
              aria-current={type === "USER" ? "page" : undefined}
            >
              Users
            </Link>
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
          <div className="mt-4 rounded-xl border bd-bd bg-white overflow-x-auto"><table className="w-full text-sm">
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="When the audit event occurred">When</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Action performed">Action</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Entity type affected">Type</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Entity id">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Quick links to related pages">Links</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Extra metadata captured">Meta</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                                const links: any[] = [];
                if (r.reportId) links.push(<Link key="rep" href={"/admin/reports/" + r.reportId} style={chip}>Report</Link>);
                if (r.listingId) links.push(<Link key="lst" href={"/listings/" + r.listingId} style={chip}>Listing</Link>);
                if (r.userId) links.push(<Link key="usr" href={"/seller/" + r.userId} style={chip}>User</Link>);
                return (
                  <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
                    <td className="px-4 py-3 bd-ink2 whitespace-nowrap">{fmt(r.createdAt)}</td>
                    <td className="px-4 py-3 bd-ink2">
                      <div style={{ fontWeight: 900 }}>{r.action}</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>admin: {r.adminId}</div>
                    </td>
                    <td className="px-4 py-3 bd-ink2">{r.entityType}</td>
                    <td className="px-4 py-3 bd-ink2">
                      <div style={{ fontFamily: "monospace" }}>{r.entityId}</div>
                    </td>
                    <td className="px-4 py-3 bd-ink2">
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{links.length ? links : <span style={{ opacity: 0.6 }}>—</span>}</div>
                    </td>
                    <td className="px-4 py-3 bd-ink2 max-w-[420px]">
                      <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {r.meta ? JSON.stringify(r.meta, null, 2) : "—"}
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
          </table></div>
        </div>
      </div>
    </div>
  );
}
