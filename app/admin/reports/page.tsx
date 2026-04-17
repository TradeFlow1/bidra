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

function FilterTab(props: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={props.href}
      className={props.active
        ? "inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-100 px-3 py-2 text-sm font-extrabold text-neutral-950"
        : "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-sky-600"}
    >
      <span>{props.label}</span>
      <span className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-xs font-extrabold text-neutral-900">{props.count}</span>
    </Link>
  );
}

function MetaPill(props: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold text-neutral-900">
      {props.children}
    </span>
  );
}

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

  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Admin reports</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Marketplace reports</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Review open and resolved reports, inspect listing context, and move quickly through moderation work.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterTab href="/admin/reports?status=open" active={!showResolved} label="Open" count={openCount} />
              <FilterTab href="/admin/reports?status=resolved" active={showResolved} label="Resolved" count={resolvedCount} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Current view</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{showResolved ? "Resolved reports" : "Open reports"}</div>
            <div className="mt-1 text-sm text-neutral-600">{showResolved ? "Completed moderation history." : "Active moderation queue."}</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Open count</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{openCount}</div>
            <div className="mt-1 text-sm text-neutral-600">Reports still awaiting resolution.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Resolved count</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{resolvedCount}</div>
            <div className="mt-1 text-sm text-neutral-600">Reports already actioned or cleared.</div>
          </div>
        </div>

        {reports.length === 0 ? (
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-sm font-extrabold bd-ink">No reports found</div>
            <div className="mt-2 text-sm bd-ink2 leading-7">
              {showResolved ? "There are no resolved reports yet." : "There are no open reports right now."}
            </div>
          </section>
        ) : (
          <section className="space-y-3">
            {reports.map((r) => (
              <article key={r.id} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Report <span className="normal-case tracking-normal">• <DateTimeText value={r.createdAt} /></span>
                    </div>

                    <h2 className="mt-2 text-lg font-extrabold tracking-tight bd-ink">
                      <Link href={"/admin/reports/" + r.id} className="bd-link font-extrabold">
                        {r.listing?.title ? r.listing.title : "Listing " + r.listingId}
                      </Link>
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <MetaPill>{r.resolved ? "RESOLVED" : "OPEN"}</MetaPill>
                      <MetaPill>Reason: {r.reason}</MetaPill>
                      <MetaPill>Listing: {r.listing?.status ? String(r.listing.status) : "UNKNOWN"}</MetaPill>
                      <MetaPill>Reporter: {r.reporter?.email ? r.reporter.email : "Unknown"}</MetaPill>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={"/admin/reports/" + r.id} className="bd-btn bd-btn-ghost text-center">
                      Open report
                    </Link>
                    <Link
                      href={"/listings/" + r.listingId + "?returnTo=" + encodeURIComponent("/admin/reports/" + r.id)}
                      className="bd-btn bd-btn-ghost text-center"
                    >
                      View listing
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
