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

function FilterTab(props: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={props.href}
      className={props.active
        ? "inline-flex items-center rounded-full border border-black/10 bg-neutral-950 px-3 py-2 text-sm font-extrabold text-white"
        : "inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-neutral-700"}
      aria-current={props.active ? "page" : undefined}
    >
      {props.label}
    </Link>
  );
}

function auditPriority(action: string) {
  const a = action.toUpperCase();
  if (a.includes("DELETE") || a.includes("SUSPEND") || a.includes("BLOCK") || a.includes("STRIKE")) return "High";
  if (a.includes("RESOLVE") || a.includes("REOPEN") || a.includes("UNBLOCK") || a.includes("UNSUSPEND")) return "Medium";
  return "Normal";
}

function shortJsonSummary(value: unknown) {
  if (!value || typeof value !== "object") return "No metadata";
  const data = value as Record<string, unknown>;
  const keys = ["reason", "decision", "note", "status", "ip", "source", "category", "url", "pageUrl", "userAgent"];
  const parts = keys
    .filter((key) => data[key] !== undefined && data[key] !== null && String(data[key]).trim())
    .slice(0, 4)
    .map((key) => key + ": " + String(data[key]).slice(0, 80));
  return parts.length ? parts.join(" | ") : "Metadata captured";
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

  const qp = (k: string, v: string) => {
    const sp = new URLSearchParams();
    if (type) sp.set("type", type);
    if (q) sp.set("q", q);
    sp.set(k, v);
    return "/admin/audit?" + sp.toString();
  };

  return (
    <main className="bd-container py-10">
      <div className="container max-w-7xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Admin audit</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Admin audit log</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Review the latest admin actions, filter by entity type, and inspect related links, report IDs, listing IDs, user IDs, and captured metadata.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/admin" className="bd-btn bd-btn-ghost text-center">
                Back to admin
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <InfoCard
            title="Rows shown"
            value={rows.length}
            note="Latest 200 matching trust-operation actions."
          />
          <InfoCard
            title="Type filter"
            value={type || "ALL"}
            note="Current entity-type scope."
          />
          <InfoCard
            title="Query"
            value={q || "—"}
            note="Matches action and related IDs."
          />
        </div>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
          <div>
            <div className="text-sm font-extrabold bd-ink">Filters</div>
            <div className="mt-1 text-sm bd-ink2">Filter by entity type or search across actions, report IDs, listing IDs, user IDs, and admin IDs.</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterTab href="/admin/audit" active={!type} label="All" />
            <FilterTab href={qp("type", "REPORT")} active={type === "REPORT"} label="Reports" />
            <FilterTab href={qp("type", "LISTING")} active={type === "LISTING"} label="Listings" />
            <FilterTab href={qp("type", "USER")} active={type === "USER"} label="Users" />
          </div>

          <form method="get" action="/admin/audit" className="flex flex-wrap gap-3">
            <input type="hidden" name="type" value={type || ""} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search action / IDs (reportId, listingId, userId, entityId)"
              className="min-w-[320px] rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
            />
            <button type="submit" className="bd-btn bd-btn-ghost text-center">
              Search
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-black/10 px-6 py-4">
            <div className="text-sm font-extrabold bd-ink">Audit table</div>
            <div className="mt-1 text-sm bd-ink2">
              Action context, related links, and raw metadata are shown together for review.
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="px-6 py-8 text-sm bd-ink2">No audit log rows found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-black/10 bg-white/70">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-xs font-extrabold bd-ink">When</th>
                    <th className="px-4 py-3 text-xs font-extrabold bd-ink">Action</th>
                    <th className="px-4 py-3 text-xs font-extrabold bd-ink">Type</th>
                    <th className="px-4 py-3 text-xs font-extrabold bd-ink">Entity</th>
                    <th className="px-4 py-3 text-xs font-extrabold bd-ink">Links</th>
                    <th className="px-4 py-3 text-xs font-extrabold bd-ink">Meta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {rows.map((r) => {
                    const links: React.ReactNode[] = [];
                    const metaSummary = shortJsonSummary(r.meta);
                    if (r.reportId) links.push(<Link key="rep" href={"/admin/reports/" + r.reportId} className="bd-btn bd-btn-ghost text-center">Report</Link>);
                    if (r.listingId) links.push(<Link key="lst" href={"/listings/" + r.listingId} className="bd-btn bd-btn-ghost text-center">Listing</Link>);
                    if (r.userId) links.push(<Link key="usr" href={"/seller/" + r.userId} className="bd-btn bd-btn-ghost text-center">User</Link>);

                    return (
                      <tr key={r.id} className="align-top hover:bg-neutral-50">
                        <td className="px-4 py-4 bd-ink2 whitespace-nowrap">{fmt(r.createdAt)}</td>
                        <td className="px-4 py-4 bd-ink2">
                          <div className="font-extrabold bd-ink">{r.action}</div>
                          <div className="mt-1 text-xs opacity-80">admin: {r.adminId}</div>
                          <div className="mt-2 text-xs bd-ink2">Review cue: {metaSummary}</div>
                        </td>
                        <td className="px-4 py-4">
                          <MetaPill>{r.entityType}</MetaPill>
                        </td>
                        <td className="px-4 py-4 bd-ink2">
                          <div className="font-mono text-xs">{r.entityId}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">{links.length ? links : <span className="text-sm bd-ink2 opacity-60">—</span>}</div>
                        </td>
                        <td className="px-4 py-4 bd-ink2 max-w-[420px]">
                          <pre className="m-0 whitespace-pre-wrap break-words rounded-2xl border border-black/10 bg-neutral-50 p-3 text-[11px] leading-5">{r.meta ? JSON.stringify(r.meta, null, 2) : "—"}</pre>
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
