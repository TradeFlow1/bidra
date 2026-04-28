import Link from "next/link"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login?next=/admin")

  const adult = await requireAdult(session)
  if (!adult.ok) redirect("/account/restrictions")

  const role = session.user.role
  if (role !== "ADMIN") redirect("/")

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin" className="text-sm font-semibold hover:opacity-90">
          ← Back to Admin
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/admin/reports" className="rounded-md border border-black/10 px-3 py-1 hover:bg-black/5">Reports</Link>
          <Link href="/admin/users" className="rounded-md border border-black/10 px-3 py-1 hover:bg-black/5">Users</Link>
          <Link href="/admin/listings" className="rounded-md border border-black/10 px-3 py-1 hover:bg-black/5">Listings</Link>
          <Link href="/admin/audit" className="rounded-md border border-black/10 px-3 py-1 hover:bg-black/5">Audit log</Link>
        </div>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </div>
  )
}
