import Link from "next/link"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminHome() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const adult = await requireAdult(session)
  if (!adult.ok) redirect("/account/restrictions")

  const role = (session.user as any).role
  if (role !== "ADMIN") redirect("/")

  const card = "rounded-xl border border-black/10 bg-white p-4 shadow-sm"
  const title = "text-sm font-semibold"
  const sub = "mt-1 text-sm text-black/60"

  return (
    <main>
      <h1 className="text-3xl font-semibold">Admin</h1>
      <p className="mt-2 text-sm text-black/60">
        Moderate reports, listings, and users. Actions are logged.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className={card}>
          <div className={title}>Reports</div>
          <div className={sub}>Review open and resolved reports.</div>
          <div className="mt-3 flex gap-2">
            <Link href="/admin/reports" className="bd-btn bd-btn-primary">Open reports</Link>
            <Link href="/admin/reports?status=RESOLVED" className="bd-btn bd-btn-ghost">Resolved</Link>
          </div>
        </div>

        <div className={card}>
          <div className={title}>Users</div>
          <div className={sub}>Strikes, blocks, and user status.</div>
          <div className="mt-3">
            <Link href="/admin/users" className="bd-btn bd-btn-primary">Manage users</Link>
          </div>
        </div>

        <div className={card}>
          <div className={title}>Listings</div>
          <div className={sub}>Inspect, suspend, delete, and review listing states.</div>
          <div className="mt-3">
            <Link href="/admin/listings" className="bd-btn bd-btn-primary">Manage listings</Link>
          </div>
        </div>

        <div className={card}>
          <div className={title}>Audit log</div>
          <div className={sub}>See what moderation actions occurred and when.</div>
          <div className="mt-3">
            <Link href="/admin/audit" className="bd-btn bd-btn-primary">View audit</Link>
            <Link href="/admin/events" className="bd-btn bd-btn-ghost">Events</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
