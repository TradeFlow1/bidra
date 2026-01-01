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

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">
        Use the admin tools to moderate listings, reports, and users.
      </p>

      <ul className="mt-6 space-y-2 text-sm">
        <li>• <a href="/admin/reports">Reports</a></li>
        <li>• <a href="/admin/users">Users</a></li>
        <li>• <a href="/admin/listings">Listings</a></li>
        <li>• <a href="/admin/audit">Audit log</a></li>
      </ul>
    </main>
  )
}
