import Link from "next/link"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminHome() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login?next=/admin")

  const adult = await requireAdult(session)
  if (!adult.ok) redirect("/account/restrictions")

  const role = session.user.role
  if (role !== "ADMIN") redirect("/")

  const [{ openReports, openListings, unresolvedNoShow }, { activeBlocks }] = await Promise.all([
    Promise.all([
      prisma.report.count({ where: { resolved: false } }),
      prisma.listing.count({ where: { status: "SUSPENDED" } }),
      prisma.adminEvent.count({ where: { type: "ORDER_NO_SHOW_REPORTED" } }),
    ]).then(([openReports, openListings, unresolvedNoShow]) => ({ openReports, openListings, unresolvedNoShow })),
    prisma.user.count({ where: { policyBlockedUntil: { gt: new Date() } } }).then((activeBlocks) => ({ activeBlocks })),
  ]);

  const card = "rounded-xl border border-black/10 bg-white p-4 shadow-sm"
  const title = "text-sm font-semibold"
  const sub = "mt-1 text-sm text-black/60"

  return (
    <main>
      <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Current role: Admin account</div>
      <h1 className="mt-2 text-3xl font-semibold">Admin workspace</h1>
      <p className="mt-2 text-sm text-black/60">
        Use Admin as a trust operations workspace: review evidence, choose proportional actions, and keep every moderation decision auditable. Buyer and seller account tools remain available from the account dashboard.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}><div className="text-xs font-semibold uppercase tracking-wide text-black/50">Open reports</div><div className="mt-1 text-3xl font-extrabold">{openReports}</div><div className={sub}>Awaiting evidence review.</div></div>
        <div className={card}><div className="text-xs font-semibold uppercase tracking-wide text-black/50">Suspended listings</div><div className="mt-1 text-3xl font-extrabold">{openListings}</div><div className={sub}>Need decision or restore.</div></div>
        <div className={card}><div className="text-xs font-semibold uppercase tracking-wide text-black/50">Active user blocks</div><div className="mt-1 text-3xl font-extrabold">{activeBlocks}</div><div className={sub}>Restricted user accounts.</div></div>
        <div className={card}><div className="text-xs font-semibold uppercase tracking-wide text-black/50">No-show reports</div><div className="mt-1 text-3xl font-extrabold">{unresolvedNoShow}</div><div className={sub}>Order risk signals logged.</div></div>
      </div>

      <div className="mt-6 grid gap-2 md:grid-cols-2">
        <div className={card}>
          <div className={title}>Reports</div>
          <div className={sub}>Triage open reports, inspect evidence, and close the loop with an auditable decision.</div>
          <div className="mt-3 flex gap-2">
            <Link href="/admin/reports" className="bd-btn bd-btn-primary">Open reports</Link>
            <Link href="/admin/reports?status=RESOLVED" className="bd-btn bd-btn-ghost">Resolved</Link>
          </div>
        </div>

        <div className={card}>
          <div className={title}>Users</div>
          <div className={sub}>Review account status, strikes, and blocks before applying user restrictions.</div>
          <div className="mt-3">
            <Link href="/admin/users" className="bd-btn bd-btn-primary">Manage users</Link>
          </div>
        </div>

        <div className={card}>
          <div className={title}>Listings</div>
          <div className={sub}>Inspect listing state and report context before suspending, restoring, or removing content.</div>
          <div className="mt-3">
            <Link href="/admin/listings" className="bd-btn bd-btn-primary">Manage listings</Link>
          </div>
        </div>

        <div className={card}>
          <div className={title}>Audit log</div>
          <div className={sub}>Trace moderator actions, related reports, listing IDs, user IDs, and captured metadata.</div>
          <div className="mt-3">
            <Link href="/admin/audit" className="bd-btn bd-btn-primary">View audit</Link>
            <Link href="/admin/events" className="bd-btn bd-btn-ghost">Events</Link>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className={card}>
          <div className={title}>Operator diagnostics</div>
          <div className={sub}>Check production readiness, required environment variables, deployment metadata, and database connectivity.</div>
          <div className="mt-3">
            <Link href="/admin/ops" className="bd-btn bd-btn-primary">Open diagnostics</Link>
          </div>
        </div>
      </div>
    </main>
  )
}

