import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import DateTimeText from "@/components/date-time-text";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminEventsPage({ searchParams }: { searchParams?: any }) {
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
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  if (!isAdmin) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Admin events</h1>
        <p>Not authorised.</p>
      </div>
    );
  }

  const q = String(searchParams?.q || "").trim().slice(0, 80);
  const chipBase: React.CSSProperties = { textDecoration: "none", padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.15)", fontWeight: 800, background: "white", color: "inherit" };
  function chipStyle(active: boolean): React.CSSProperties {
    return active ? Object.assign({}, chipBase, { background: "#111", color: "white" }) : chipBase;
  }
  const type = String(searchParams?.type || "").trim().slice(0, 80);

  const where: Prisma.AdminEventWhereInput | undefined = (q || type)
    ? {
        AND: [
          type ? { type: type } : {},
          q
            ? {
                OR: [
                  { type: { contains: q, mode: "insensitive" as const } },
                  { userId: { contains: q, mode: "insensitive" as const } },
                  { orderId: { contains: q, mode: "insensitive" as const } },
                ],
              }
            : {},
        ],
      }
    : undefined;

  const rows = await prisma.adminEvent.findMany({
    where,
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

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Link href="/admin/events" style={chipStyle(!type)}>All events</Link>
        <Link href="/admin/events?type=ORDER_PICKUP_SCHEDULED" style={chipStyle(type === "ORDER_PICKUP_SCHEDULED")}>Pickup scheduled</Link>
        <Link href="/admin/events?type=ORDER_RESCHEDULE_REQUESTED" style={chipStyle(type === "ORDER_RESCHEDULE_REQUESTED")}>Reschedule requested</Link>
        <Link href="/admin/events?type=ORDER_NO_SHOW_REPORTED" style={chipStyle(type === "ORDER_NO_SHOW_REPORTED")}>No-show reported</Link>
      </div>

      <form method="get" style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input type="hidden" name="type" value={type} />
        <input
          name="q"
          defaultValue={q}
          placeholder='Filter (e.g. "ORDER_", userId, orderId)'
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)", minWidth: 280 }}
        />
        <button type="submit" style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)", background: "white", fontWeight: 800 }}>
          Filter
        </button>
        {q || type ? (
          <Link href="/admin/events" style={{ textDecoration: "underline", fontSize: 12 }}>Clear</Link>
        ) : null}
      </form>

      <div className="mt-4 rounded-xl border bd-bd bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/60 border-b bd-bd text-left">
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="When the event was recorded">Time</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Event type">Type</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="User id involved">User</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Order id if relevant">Order</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Readable event summary">Summary</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Event payload / details">Data</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Admin review actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const d = r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : null;
              const requestedByRole = d && typeof d["requestedByRole"] === "string" ? String(d["requestedByRole"]) : null;
              const reportedByRole = d && typeof d["reportedByRole"] === "string" ? String(d["reportedByRole"]) : null;
              const actorRole = requestedByRole || reportedByRole || null;
              const currentScheduledAt = d && d["currentScheduledAt"] ? String(d["currentScheduledAt"]) : null;
              const scheduledAt = d && d["scheduledAt"] ? String(d["scheduledAt"]) : null;
              const whenText = currentScheduledAt || scheduledAt || null;
              const reasonText = d && typeof d["reason"] === "string" ? String(d["reason"]) : null;

              const backTo = "/admin/events?type=" + encodeURIComponent(type || r.type);
              const isRescheduleRequest = r.type === "ORDER_RESCHEDULE_REQUESTED";
              const isNoShowReport = r.type === "ORDER_NO_SHOW_REPORTED";
              return (
                <tr key={r.id} className="border-t bd-bd hover:bg-neutral-50">
                  <td className="px-4 py-3 bd-ink2 text-xs whitespace-nowrap"><DateTimeText value={r.createdAt} /></td>
                  <td className="px-4 py-3 bd-ink text-xs font-extrabold whitespace-nowrap">{r.type}</td>
                  <td style={{ padding: 10, fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>{r.userId || "-"}</td>
                  <td style={{ padding: 10, fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
                    {r.orderId ? <Link href={"/orders/" + r.orderId} style={{ textDecoration: "underline" }}>{r.orderId}</Link> : "-"}
                  </td>
                  <td className="px-4 py-3 bd-ink2 text-xs">
                    <div className="grid gap-1">
                      <div><span className="font-extrabold bd-ink">Role:</span> {actorRole || "-"}</div>
                      <div><span className="font-extrabold bd-ink">When:</span> {whenText || "-"}</div>
                      <div><span className="font-extrabold bd-ink">Reason:</span> {reasonText || "-"}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 bd-ink2 text-xs">
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.data ? JSON.stringify(r.data, null, 2) : "-"}</pre>
                  </td>
                  <td className="px-4 py-3 bd-ink2 text-xs">
                    {isRescheduleRequest && r.orderId ? (
                      <div className="grid gap-2">
                        <form action="/api/admin/orders/reschedule-request/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="APPROVE" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="scheduledAt" type="datetime-local" className="bd-input" />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-primary">Approve + reschedule</button>
                        </form>
                        <form action="/api/admin/orders/reschedule-request/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="REJECT" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-ghost">Reject request</button>
                        </form>
                      </div>
                    ) : null}

                    {isNoShowReport && r.orderId ? (
                      <div className="grid gap-2">
                        <form action="/api/admin/orders/no-show-report/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="REVIEWED_BUYER_AT_FAULT" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-primary">Buyer at fault</button>
                        </form>
                        <form action="/api/admin/orders/no-show-report/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="REVIEWED_SELLER_AT_FAULT" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-primary">Seller at fault</button>
                        </form>
                        <form action="/api/admin/orders/no-show-report/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="REVIEWED_INCONCLUSIVE" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-ghost">Inconclusive</button>
                        </form>
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 12, opacity: 0.7 }}>No events yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
