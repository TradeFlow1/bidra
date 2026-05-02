import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import DateTimeText from "@/components/date-time-text";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function FilterChip(props: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={props.href}
      className={props.active
        ? "inline-flex items-center rounded-full border border-black/10 bg-neutral-950 px-3 py-2 text-xs font-extrabold text-white"
        : "inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-neutral-700"}
    >
      {props.label}
    </Link>
  );
}

function eventPriority(type: string) {
  const t = type.toUpperCase();
  if (t.includes("REPORT") || t.includes("NO_SHOW") || t.includes("BUG")) return "High";
  if (t.includes("FEEDBACK") || t.includes("RESCHEDULE")) return "Medium";
  return "Normal";
}

function dataText(data: Record<string, unknown> | null, key: string) {
  if (!data || data[key] === undefined || data[key] === null) return null;
  const value = String(data[key]).trim();
  return value || null;
}

function InfoCard(props: {
  title: string;
  value: React.ReactNode;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{props.title}</div>
      <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{props.value}</div>
      <div className="mt-1 text-sm text-neutral-600">{props.note}</div>
    </div>
  );
}

function MetaPill(props: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold text-neutral-900">
      {props.children}
    </span>
  );
}

export default async function AdminEventsPage({ searchParams }: { searchParams?: any }) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-4xl space-y-5">
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Admin events</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink">Access restricted</h1>
            <p className="mt-2 text-sm bd-ink2 leading-7">Not allowed: {gate.reason}</p>
          </section>
        </div>
      </main>
    );
  }

  const session = await auth();
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  if (!isAdmin) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-4xl space-y-5">
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Admin events</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink">Not authorised</h1>
            <p className="mt-2 text-sm bd-ink2 leading-7">You do not have access to this admin surface.</p>
          </section>
        </div>
      </main>
    );
  }

  const q = String(searchParams?.q || "").trim().slice(0, 80);
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
    <main className="bd-container py-10">
      <div className="container max-w-7xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Admin events</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Internal event stream</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Review internal audit events, filter by event type, and inspect summary context alongside raw payload data.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/admin" className="bd-btn bd-btn-ghost text-center">
                Admin home
              </Link>
              <Link href="/admin/audit" className="bd-btn bd-btn-ghost text-center">
                Audit log
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <InfoCard
            title="Rows shown"
            value={rows.length}
            note="Up to 200 matching admin events."
          />
          <InfoCard
            title="Type filter"
            value={type || "All events"}
            note="Current event-type scope."
          />
          <InfoCard
            title="Search query"
            value={q || "None"}
            note="Matches type, userId, or orderId."
          />
        </div>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
          <div>
            <div className="text-sm font-extrabold bd-ink">Event filters</div>
            <div className="mt-1 text-sm bd-ink2">Choose a type shortcut or apply a text filter.</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterChip href="/admin/events" active={!type} label="All events" />
            <FilterChip href="/admin/events?type=BUY_NOW_PLACED" active={type === "BUY_NOW_PLACED"} label="Buy now placed" />
            <FilterChip href="/admin/events?type=ORDER_RESCHEDULE_REQUESTED" active={type === "ORDER_RESCHEDULE_REQUESTED"} label="Reschedule requested" />
            <FilterChip href="/admin/events?type=ORDER_RESCHEDULE_OPTIONS_POSTED" active={type === "ORDER_RESCHEDULE_OPTIONS_POSTED"} label="Replacement options posted" />
            <FilterChip href="/admin/events?type=ORDER_RESCHEDULE_CONFIRMED" active={type === "ORDER_RESCHEDULE_CONFIRMED"} label="Reschedule confirmed" />
            <FilterChip href="/admin/events?type=ORDER_NO_SHOW_REPORTED" active={type === "ORDER_NO_SHOW_REPORTED"} label="No-show reported" />
            <FilterChip href="/admin/events?type=ORDER_NO_SHOW_REPORT_REVIEWED" active={type === "ORDER_NO_SHOW_REPORT_REVIEWED"} label="No-show reviewed" />
          </div>

          <form method="get" className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="type" value={type} />
            <input
              name="q"
              defaultValue={q}
              placeholder='Filter (e.g. "ORDER_", userId, orderId)'
              className="min-w-[280px] rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
            />
            <button type="submit" className="bd-btn bd-btn-ghost text-center">
              Filter
            </button>
            {q || type ? (
              <Link href="/admin/events" className="bd-link text-sm font-semibold">
                Clear
              </Link>
            ) : null}
          </form>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-black/10 px-6 py-4">
            <div className="text-sm font-extrabold bd-ink">Event table</div>
            <div className="mt-1 text-sm bd-ink2">
              Summary fields are shown beside raw payload data for faster inspection.
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="px-6 py-8 text-sm bd-ink2">No events yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm align-top">
                <thead className="border-b border-black/10 bg-white/70">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-xs font-extrabold bd-ink">Time</th>
                    <th className="px-4 py-3 text-xs font-extrabold bd-ink">Type</th>
                    <th className="px-4 py-3 text-xs font-extrabold bd-ink">User</th>
                    <th className="px-4 py-3 text-xs font-extrabold bd-ink">Order</th>
                    <th className="px-4 py-3 text-xs font-extrabold bd-ink">Summary</th>
                    <th className="px-4 py-3 text-xs font-extrabold bd-ink">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {rows.map((r) => {
                    const d = r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : null;
                    const priority = eventPriority(r.type);
                    const sourceText = dataText(d, "source");
                    const ipText = dataText(d, "ip");
                    const urlText = dataText(d, "url") || dataText(d, "pageUrl");
                    const categoryText = dataText(d, "category");
                    const userAgentText = dataText(d, "userAgent") || dataText(d, "ua");
                    const requestedByRole = d && typeof d["requestedByRole"] === "string" ? String(d["requestedByRole"]) : null;
                    const reportedByRole = d && typeof d["reportedByRole"] === "string" ? String(d["reportedByRole"]) : null;
                    const actorRole = requestedByRole || reportedByRole || null;
                    const currentScheduledAt = d && d["currentScheduledAt"] ? String(d["currentScheduledAt"]) : null;
                    const scheduledAt = d && d["scheduledAt"] ? String(d["scheduledAt"]) : null;
                    const whenText = currentScheduledAt || scheduledAt || null;
                    const reasonText = d && typeof d["reason"] === "string" ? String(d["reason"]) : null;
                    const decisionText = d && typeof d["decision"] === "string" ? String(d["decision"]) : null;
                    const noteText = d && typeof d["note"] === "string" ? String(d["note"]) : null;
                    const isNoShowReviewed = r.type === "ORDER_NO_SHOW_REPORT_REVIEWED";

                    return (
                      <tr key={r.id} className="hover:bg-neutral-50 align-top">
                        <td className="px-4 py-4 text-xs bd-ink2 whitespace-nowrap"><DateTimeText value={r.createdAt} /></td>
                        <td className="px-4 py-4">
                          <MetaPill>{r.type}</MetaPill>
                        </td>
                        <td className="px-4 py-4 text-xs font-mono bd-ink2 whitespace-nowrap">{r.userId || "-"}</td>
                        <td className="px-4 py-4 text-xs font-mono bd-ink2 whitespace-nowrap">
                          {r.orderId ? (
                            <Link href={"/orders/" + r.orderId} className="bd-link font-semibold">
                              {r.orderId}
                            </Link>
                          ) : "-" }
                        </td>
                        <td className="px-4 py-4 text-xs bd-ink2">
                          <div className="grid gap-1.5">
                            <div><span className="font-extrabold bd-ink">Role:</span> {actorRole || "-"}</div>
                            <div><span className="font-extrabold bd-ink">When:</span> {whenText || "-"}</div>
                            <div><span className="font-extrabold bd-ink">Reason:</span> {reasonText || "-"}</div>
                            {isNoShowReviewed ? <div><span className="font-extrabold bd-ink">Decision:</span> {decisionText || "-"}</div> : null}
                            {isNoShowReviewed ? <div><span className="font-extrabold bd-ink">Note:</span> {noteText || "-"}</div> : null}
                            <div><span className="font-extrabold bd-ink">Source:</span> {sourceText || "-"}</div>
                            <div><span className="font-extrabold bd-ink">IP:</span> {ipText || "-"}</div>
                            <div><span className="font-extrabold bd-ink">URL:</span> {urlText || "-"}</div>
                            <div><span className="font-extrabold bd-ink">Category:</span> {categoryText || "-"}</div>
                            <div><span className="font-extrabold bd-ink">User agent:</span> {userAgentText ? userAgentText.slice(0, 120) : "-"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs bd-ink2">
                          <pre className="m-0 whitespace-pre-wrap rounded-2xl border border-black/10 bg-neutral-50 p-3 text-[11px] leading-5">{r.data ? JSON.stringify(r.data, null, 2) : "-"}</pre>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
