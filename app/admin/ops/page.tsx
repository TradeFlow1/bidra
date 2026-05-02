import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Check = {
  name: string;
  status: "ok" | "degraded";
  detail: string;
};

function envPresent(name: string) {
  return Boolean(String(process.env[name] || "").trim());
}

function StatusPill(props: { status: "ok" | "degraded" }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold text-neutral-900">
      {props.status === "ok" ? "OK" : "Needs attention"}
    </span>
  );
}

function InfoCard(props: { title: string; value: React.ReactNode; note: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-neutral-500">{props.title}</div>
      <div className="mt-2 text-2xl font-extrabold bd-ink">{props.value}</div>
      <div className="mt-1 text-sm bd-ink2">{props.note}</div>
    </div>
  );
}

export default async function AdminOpsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/auth/login?next=/admin/ops");
  if (user.role !== "ADMIN") redirect("/");

  const requiredEnv = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "NEXT_PUBLIC_SITE_URL"];
  const optionalEnv = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY", "BLOB_READ_WRITE_TOKEN", "FT_ENABLED", "PHONE_GATE_ENABLED"];

  const checks: Check[] = [];

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({ name: "Database", status: "ok", detail: "Prisma connectivity check passed." });
  } catch {
    checks.push({ name: "Database", status: "degraded", detail: "Prisma connectivity check failed." });
  }

  const missingRequired = requiredEnv.filter((name) => !envPresent(name));
  checks.push({
    name: "Required environment",
    status: missingRequired.length ? "degraded" : "ok",
    detail: missingRequired.length ? "Missing: " + missingRequired.join(", ") : "Required environment variables are present.",
  });

  checks.push({
    name: "Canonical URL",
    status: envPresent("NEXT_PUBLIC_SITE_URL") || envPresent("NEXTAUTH_URL") ? "ok" : "degraded",
    detail: "Canonical domain is used by auth redirects, sitemap, and middleware.",
  });

  const okCount = checks.filter((check) => check.status === "ok").length;
  const degradedCount = checks.length - okCount;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-7xl space-y-5">
        <section className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Operator diagnostics</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Production readiness</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Check core runtime, database, deployment, and environment readiness without exposing secret values.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin" className="bd-btn bd-btn-ghost text-center">Admin home</Link>
              <Link href="/api/health" className="bd-btn bd-btn-ghost text-center">Health JSON</Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <InfoCard title="Checks passing" value={okCount} note="Operator checks currently OK." />
          <InfoCard title="Needs attention" value={degradedCount} note="Checks that should be reviewed before launch." />
          <InfoCard title="Environment" value={process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown"} note="Runtime deployment environment." />
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">Readiness checks</div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="px-4 py-3 text-xs font-extrabold bd-ink">Check</th>
                  <th className="px-4 py-3 text-xs font-extrabold bd-ink">Status</th>
                  <th className="px-4 py-3 text-xs font-extrabold bd-ink">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {checks.map((check) => (
                  <tr key={check.name} className="align-top">
                    <td className="px-4 py-4 font-extrabold bd-ink">{check.name}</td>
                    <td className="px-4 py-4"><StatusPill status={check.status} /></td>
                    <td className="px-4 py-4 text-sm bd-ink2">{check.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-sm font-extrabold bd-ink">Required environment variables</div>
            <div className="mt-4 grid gap-2">
              {requiredEnv.map((name) => (
                <div key={name} className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-3 text-sm">
                  <span className="font-mono bd-ink">{name}</span>
                  <StatusPill status={envPresent(name) ? "ok" : "degraded"} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-sm font-extrabold bd-ink">Optional integration variables</div>
            <div className="mt-4 grid gap-2">
              {optionalEnv.map((name) => (
                <div key={name} className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-3 text-sm">
                  <span className="font-mono bd-ink">{name}</span>
                  <StatusPill status={envPresent(name) ? "ok" : "degraded"} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
