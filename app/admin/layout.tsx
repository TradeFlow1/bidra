import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { redirect } from "next/navigation";
import { appNarrowShell } from "@/components/marketplace-redesign";

export const dynamic = "force-dynamic";

const adminLinks = [
  ["Reports", "/admin/reports"],
  ["Users", "/admin/users"],
  ["Listings", "/admin/listings"],
  ["Audit log", "/admin/audit"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/admin");

  const adult = await requireAdult(session);
  if (!adult.ok) redirect("/account/restrictions");

  const role = session.user.role;
  if (role !== "ADMIN") redirect("/");

  return (
    <main className={`${appNarrowShell} py-5 text-[#0F172A] sm:py-7`}>
      <div className="rounded-[28px] border border-[#D8E1EA] bg-[linear-gradient(135deg,#F8FBFC_0%,#EAF6F8_100%)] p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/admin" className="bd-back-link w-fit">
            ← Admin home
          </Link>

          <nav aria-label="Admin sections" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            {adminLinks.map(([label, href]) => (
              <Link key={href} href={href} className="bd-btn bd-btn-secondary rounded-2xl text-xs">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </main>
  );
}
