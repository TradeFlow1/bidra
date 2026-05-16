import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { redirect } from "next/navigation";
import { PageHero, SectionCard } from "@/components/marketplace-redesign";

export const dynamic = "force-dynamic";

const workspaces = [
  {
    title: "Reports",
    copy: "Triage open reports, review evidence, and record the decision.",
    primaryHref: "/admin/reports",
    primaryLabel: "Open reports",
    secondaryHref: "/admin/reports?status=RESOLVED",
    secondaryLabel: "Resolved",
  },
  {
    title: "Users",
    copy: "Review account status, strikes, blocks, and verification signals.",
    primaryHref: "/admin/users",
    primaryLabel: "Manage users",
  },
  {
    title: "Listings",
    copy: "Inspect listing state and report context before moderation action.",
    primaryHref: "/admin/listings",
    primaryLabel: "Manage listings",
  },
  {
    title: "Audit log",
    copy: "Trace moderator actions, IDs, and captured metadata.",
    primaryHref: "/admin/audit",
    primaryLabel: "View audit",
    secondaryHref: "/admin/events",
    secondaryLabel: "Events",
  },
  {
    title: "Operator diagnostics",
    copy: "Check deployment metadata, environment status, and database connectivity.",
    primaryHref: "/admin/ops",
    primaryLabel: "Open diagnostics",
  },
];

export default async function AdminHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/admin");

  const adult = await requireAdult(session);
  if (!adult.ok) redirect("/account/restrictions");

  const role = session.user.role;
  if (role !== "ADMIN") redirect("/");

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Current role: Admin account"
        title="Admin workspace"
        description="Trust operations tools for reports, users, listings, audit logs, and diagnostics."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {workspaces.map((item) => (
          <SectionCard key={item.title} className="flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-lg font-black tracking-tight text-[#0F172A]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#475569]">{item.copy}</p>
            </div>
            <div className="bd-action-row">
              <Link href={item.primaryHref} className="bd-btn bd-btn-primary">
                {item.primaryLabel}
              </Link>
              {item.secondaryHref ? (
                <Link href={item.secondaryHref} className="bd-btn bd-btn-secondary">
                  {item.secondaryLabel}
                </Link>
              ) : null}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
