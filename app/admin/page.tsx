import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const adult = await requireAdult(session);
  if (!adult.ok) redirect("/account/restrictions");

  const role = (session.user as any).role;
  if (role !== "ADMIN") redirect("/");

  const links = [
    { href: "/admin/reports", title: "Reports", desc: "Review reports, take actions, keep the platform safe." },
    { href: "/admin/users", title: "Users", desc: "Strikes, blocks, badges, and account review." },
    { href: "/admin/listings", title: "Listings", desc: "Moderation controls and listing state management." },
    { href: "/admin/audit", title: "Audit log", desc: "Immutable admin action history and traceability." },
  ];

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="mt-2 text-sm opacity-80">
            Internal tools for moderation, compliance, and platform integrity.
          </p>
        </div>
        <Link href="/dashboard" className="rounded-md border px-3 py-2 text-sm font-medium hover:opacity-90">
          Back to dashboard
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {links.map((x) => (
          <Link key={x.href} href={x.href} className="rounded-xl border p-4 hover:opacity-90">
            <div className="text-lg font-semibold">{x.title}</div>
            <div className="mt-1 text-sm opacity-80">{x.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
