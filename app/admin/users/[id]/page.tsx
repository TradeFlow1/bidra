import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";
import { getRiskSignals, highestRiskLevel, riskLevelLabel } from "@/lib/risk-signals";

export const dynamic = "force-dynamic";

type AdminUserDetail = {
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
};

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#D8E1EA] bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">{props.label}</div>
      <div className="mt-1 text-sm font-semibold text-[#0F172A]">{props.children}</div>
    </div>
  );
}

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const admin = session?.user;
  if (!admin) redirect("/auth/login?next=/admin/users/" + params.id);
  if (admin.role !== "ADMIN") redirect("/");

  const target = (await prisma.user.findUnique({
    where: { id: params.id },
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
  })) as AdminUserDetail | null;

  if (!target) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-5xl space-y-5">
          <Card>
            <div className="p-6">
              <h1 className="text-2xl font-extrabold tracking-tight bd-ink">Admin user not found</h1>
              <div className="mt-4">
                <Link href="/admin/users" className="bd-btn bd-btn-ghost text-center">Back to users</Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const backTo = "/admin/users/" + target.id;
  const blockedUntilMs = target.policyBlockedUntil ? new Date(target.policyBlockedUntil).getTime() : 0;
  const isBlocked = blockedUntilMs > Date.now();


  const reportCounts = await prisma.report.groupBy({
    by: ["resolved"],
    where: { reporterId: target.id },
    _count: { _all: true },
  });

  const reportCount = reportCounts.reduce(function (sum, group) {
    return sum + group._count._all;
  }, 0);

  const unresolvedReportCount = reportCounts
    .filter(function (group) { return !group.resolved; })
    .reduce(function (sum, group) { return sum + group._count._all; }, 0);

  const riskSignals = getRiskSignals({
    policyStrikes: target.policyStrikes,
    policyBlockedUntil: target.policyBlockedUntil,
    reportCount,
    unresolvedReportCount,
    emailVerified: target.emailVerified,
    phoneVerified: target.phoneVerified,
    ageVerified: target.ageVerified,
    createdAt: target.createdAt,
  });

  const riskLevel = highestRiskLevel(riskSignals);return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <section className="rounded-[28px] border border-[#D8E1EA] bg-gradient-to-br from-white to-[#EAF6F8] p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Admin user detail</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">{target.username || target.email}</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">Review account state, contact confirmation signals, policy strikes, block status, risk signals, and moderation actions before applying a proportional restriction.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/users" className="bd-btn bd-btn-ghost text-center">Back to users</Link>
              <Link href={"/seller/" + target.id} className="bd-btn bd-btn-ghost text-center">Public profile</Link>
              <Link href={"/admin/audit?type=USER&q=" + encodeURIComponent(target.id)} className="bd-btn bd-btn-ghost text-center">Audit evidence</Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-4">
          <Field label="Role"><Badge>{target.role}</Badge></Field>
          <Field label="Status"><Badge>{target.isActive ? "ACTIVE" : "INACTIVE"}</Badge></Field>
          <Field label="Policy strikes"><Badge>Strikes {target.policyStrikes}</Badge></Field>
          <Field label="Blocked">{isBlocked ? <Badge>Blocked until <DateTimeText value={target.policyBlockedUntil as Date} /></Badge> : <Badge>Not blocked</Badge>}</Field>
        </section>
        <section className="rounded-[28px] border border-[#D8E1EA] bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">Verification signals</div>
          <p className="mt-2 text-sm leading-7 bd-ink2">
            These are account contact and eligibility signals available to Bidra today. They are not provider-backed government ID, biometric, liveness, escrow, payment, or shipping verification.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <Field label="Email">{target.emailVerified ? <Badge>Email confirmed</Badge> : <Badge>Email unconfirmed</Badge>}</Field>
            <Field label="Phone">{target.phoneVerified ? <Badge>Phone confirmed</Badge> : <Badge>Phone unconfirmed</Badge>}</Field>
            <Field label="18+ account">{target.ageVerified ? <Badge>Recorded</Badge> : <Badge>Not recorded</Badge>}</Field>
            <Field label="Phone on file">{target.phone ? <Badge>Present</Badge> : <Badge>Missing</Badge>}</Field>
          </div>
        </section>
        <section className="rounded-[28px] border border-[#D8E1EA] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-extrabold bd-ink">Risk signal review</div>
              <p className="mt-2 text-sm leading-7 bd-ink2">Signals below combine existing policy, report, restriction, account age, and confirmation data. They support human review and do not automatically ban, block, or label anyone as fraudulent.</p>
            </div>
            <Badge>Risk level: {riskLevelLabel(riskLevel)}</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {riskSignals.map((signal) => (
              <div key={signal.label} className="rounded-2xl border border-[#D8E1EA] bg-[#F8FAFC] p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">{riskLevelLabel(signal.level)}</div>
                <div className="mt-1 text-sm font-extrabold bd-ink">{signal.label}</div>
                <p className="mt-1 text-sm leading-6 bd-ink2">{signal.reason}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs leading-6 text-[#475569]">Report context: {reportCount} total report(s), {unresolvedReportCount} open report(s).</div>
        </section>

        <section className="rounded-[28px] border border-[#D8E1EA] bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">Moderation checklist</div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm bd-ink2 leading-7">
            <li>Open related report and audit evidence before applying a strike, block, unblock, or reset action.</li>
            <li>Use strike for policy warnings, block for temporary account restriction, and unblock only after evidence review.</li>
            <li>Every action below is routed through an admin API that creates audit evidence in AdminActionLog.</li>
          </ul>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="p-5">
              <div className="text-sm font-extrabold bd-ink">Apply policy strike</div>
              <p className="mt-2 text-sm bd-ink2">Adds one auditable policy strike. Threshold logic may apply a temporary block.</p>
              <form action="/api/admin/users/strike" method="post" className="mt-4 space-y-3">
                <input type="hidden" name="userId" value={target.id} />
                <input type="hidden" name="backTo" value={backTo} />
                <input name="reason" defaultValue="Policy review from admin user detail" className="bd-input" aria-label="Policy strike reason" />
                <button type="submit" className="bd-btn bd-btn-primary">Apply strike after evidence review</button>
              </form>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <div className="text-sm font-extrabold bd-ink">Block account</div>
              <p className="mt-2 text-sm bd-ink2">Temporarily restricts the user. Duration is clamped by the API.</p>
              <form action="/api/admin/users/block" method="post" className="mt-4 space-y-3">
                <input type="hidden" name="userId" value={target.id} />
                <input type="hidden" name="backTo" value={backTo} />
                <input name="days" type="number" min="1" max="14" defaultValue="7" className="bd-input" aria-label="Block duration in days" />
                <button type="submit" className="bd-btn bd-btn-primary">Block after evidence review</button>
              </form>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <div className="text-sm font-extrabold bd-ink">Unblock account</div>
              <p className="mt-2 text-sm bd-ink2">Clears the temporary block after review.</p>
              <form action="/api/admin/users/unblock" method="post" className="mt-4">
                <input type="hidden" name="userId" value={target.id} />
                <input type="hidden" name="backTo" value={backTo} />
                <button type="submit" className="bd-btn bd-btn-ghost">Unblock after evidence review</button>
              </form>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <div className="text-sm font-extrabold bd-ink">Remove strike</div>
              <p className="mt-2 text-sm bd-ink2">Removes one strike after evidence review.</p>
              <form action="/api/admin/users/unstrike" method="post" className="mt-4">
                <input type="hidden" name="userId" value={target.id} />
                <input type="hidden" name="backTo" value={backTo} />
                <button type="submit" className="bd-btn bd-btn-ghost">Remove one strike after evidence review</button>
              </form>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
