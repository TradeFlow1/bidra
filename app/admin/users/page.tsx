import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";
import { getRiskSignals, highestRiskLevel, riskLevelLabel } from "@/lib/risk-signals";

type AdminUserRow = {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  ageVerified: boolean;
  phone: string | null;
  policyStrikes: number;
  policyBlockedUntil: Date | null;
  createdAt: Date;
  reportCount: number;
  unresolvedReportCount: number;
};

export default async function AdminUsers() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const users = (await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      ageVerified: true,
      phone: true,
      policyStrikes: true,
      policyBlockedUntil: true,
      createdAt: true,
    },
  })) as AdminUserRow[];

  const userIds = users.map(function (u) { return u.id; });
  const reportCountsByUser = new Map<string, { total: number; open: number }>();

  if (userIds.length > 0) {
    const reportGroups = await prisma.report.groupBy({
      by: ["reporterId", "resolved"],
      where: { reporterId: { in: userIds } },
      _count: { _all: true },
    });

    reportGroups.forEach(function (group) {
      const current = reportCountsByUser.get(group.reporterId) || { total: 0, open: 0 };
      current.total += group._count._all;
      if (!group.resolved) current.open += group._count._all;
      reportCountsByUser.set(group.reporterId, current);
    });
  }

  const usersWithRisk = users.map(function (u) {
    const counts = reportCountsByUser.get(u.id) || { total: 0, open: 0 };
    return { ...u, reportCount: counts.total, unresolvedReportCount: counts.open };
  });

  const backTo = "/admin/users";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="mt-2 text-sm text-neutral-600">Review account status, contact confirmation signals, policy strikes, block state, report history, account age, and related evidence before taking user moderation action. Risk labels are review aids, not automated fraud decisions.</p>
      </div>

      <div className="grid gap-3">
        {usersWithRisk.length === 0 ? (
          <Card>
            <div className="p-4 text-sm text-neutral-600">No users need trust-operations review right now.</div>
          </Card>
        ) : null}

        {usersWithRisk.map((u: AdminUserRow) => {
          const riskSignals = getRiskSignals({
            policyStrikes: u.policyStrikes,
            policyBlockedUntil: u.policyBlockedUntil,
            reportCount: u.reportCount,
            unresolvedReportCount: u.unresolvedReportCount,
            emailVerified: u.emailVerified,
            phoneVerified: u.phoneVerified,
            ageVerified: u.ageVerified,
            createdAt: u.createdAt,
          });
          const riskLevel = highestRiskLevel(riskSignals);
          return (
          <Card key={u.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">
                  <Link className="hover:underline" href={"/admin/users/" + u.id}>
                    {u.username}
                  </Link>
                </div>
                <div className="text-sm text-neutral-600">{u.email}</div>

                <div className="mt-2 flex gap-2 flex-wrap">
                  <Badge>{u.role}</Badge>
                  <Badge>{u.isActive ? "ACTIVE" : "INACTIVE"}</Badge>
                  <Badge>Strikes {u.policyStrikes}</Badge>
                  <Badge>{u.emailVerified ? "Email confirmed" : "Email unconfirmed"}</Badge>
                  <Badge>{u.phoneVerified ? "Phone confirmed" : "Phone unconfirmed"}</Badge>
                  <Badge>{u.ageVerified ? "18+ recorded" : "18+ not recorded"}</Badge>
                  <Badge>Risk level: {riskLevelLabel(riskLevel)}</Badge>
                  <Badge>Reports {u.reportCount} / open {u.unresolvedReportCount}</Badge>
                  {u.policyBlockedUntil ? (
                    <Badge>Blocked until <DateTimeText value={u.policyBlockedUntil} /></Badge>
                  ) : null}
                </div>

                <div className="mt-2 text-xs text-neutral-600">
                  Created <DateTimeText value={u.createdAt} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href={"/admin/users/" + u.id} className="bd-btn bd-btn-primary">Open admin detail</Link>
                {u.policyStrikes > 0 ? (
                  <form action="/api/admin/users/unstrike" method="post">
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="backTo" value={backTo} />
                    <button
                      type="submit"
                      className="bd-btn bd-btn-ghost"
                      title="Remove one policy strike after review"
                    >
                      Unstrike
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </Card>
          );
        })}
      </div>
    </div>
  );
}

