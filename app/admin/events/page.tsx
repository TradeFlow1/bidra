import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminEventsPage() {
  const gate = await requireAdult();
  if (!gate.ok) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Admin events</h1>
        <p>Not allowed: {gate.reason}</p>
      </div>
    );
  }

  const session = await auth();
  const isAdmin = (session?.user as any)?.isAdmin ?? false;
  if (!isAdmin) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Admin events</h1>
        <p>Not authorised.</p>
      </div>
    );
  }

  const rows = await prisma.adminEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Admin events</h1>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/admin" style={{ textDecoration: "underline" }}>Admin home</Link>
          <Link href="/admin/audit" style={{ textDecoration: "underline" }}>Audit log</Link>
        </div>
      </div>

      <p style={{ marginTop: 8, opacity: 0.75 }}>
        Shows internal events. Key one: <b>FEEDBACK_SUBMITTED_WHILE_BLOCKED</b>.
      </p>

      <div style={{ marginTop: 14, border: "1px solid rgba(0,0,0,0.10)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.03)" }}>
              <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Time</th>
              <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Type</th>
              <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>User</th>
              <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Order</th>
              <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <td style={{ padding: 10, fontSize: 12, whiteSpace: "nowrap" }}>{new Date(r.createdAt).toLocaleString()}</td>
                <td style={{ padding: 10, fontSize: 12, fontWeight: 800 }}>{r.type}</td>
                <td style={{ padding: 10, fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>{r.userId || "-"}</td>
                <td style={{ padding: 10, fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>{r.orderId || "-"}</td>
                <td style={{ padding: 10, fontSize: 12 }}>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.data ? JSON.stringify(r.data, null, 2) : "-"}</pre>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 12, opacity: 0.7 }}>No events yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
