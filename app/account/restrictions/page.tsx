import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import DateTimeText from "@/components/date-time-text";

function StatusCard(props: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="text-sm font-extrabold bd-ink">{props.title}</div>
      <div className="mt-1 text-sm bd-ink2 leading-7">{props.subtitle}</div>
      <div className="mt-4">{props.children}</div>
    </section>
  );
}

export default async function RestrictionsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) redirect("/auth/login");

  const adult = await requireAdult(session);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { policyStrikes: true, policyBlockedUntil: true },
  });

  let blockedUntil = dbUser?.policyBlockedUntil ? new Date(dbUser.policyBlockedUntil) : null;
  if (blockedUntil) {
    const ms = blockedUntil.getTime();
    const now = Date.now();

    if (!isFinite(ms) || ms <= now) {
      await prisma.user.update({
        where: { id: user.id },
        data: { policyBlockedUntil: null },
      });
      blockedUntil = null;
    }
  }

  const isBlocked = blockedUntil ? blockedUntil.getTime() > Date.now() : false;

  const stateTitle = !adult.ok
    ? "18+ restriction (browse-only)"
    : (isBlocked ? "Policy restriction active" : "No active restrictions");

  const stateText = !adult.ok
    ? "Bidra is 18+ for accounts. If you are under 18, you can browse public listings but you cannot create listings, message, make offers, or transact."
    : (isBlocked
      ? "Your account currently has an active marketplace restriction. Review the details below and use the support options if you believe this is incorrect."
      : "There are currently no active account restrictions on this account.");

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Account restrictions</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Account status and restrictions</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                This page explains whether your account has any current access restrictions and where to go for help if you need a review.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/account" className="bd-btn bd-btn-primary text-center">
                Back to account
              </Link>
              <Link href="/contact" className="bd-btn bd-btn-ghost text-center">
                Contact support
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Current state</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{stateTitle}</div>
            <div className="mt-1 text-sm text-neutral-600">{!adult.ok ? "Browse-only access applies." : (isBlocked ? "Restriction currently active." : "No active restriction detected.")}</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Policy strikes</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{dbUser?.policyStrikes ?? 0}</div>
            <div className="mt-1 text-sm text-neutral-600">Repeated policy breaches can lead to account restrictions.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Restricted until</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{blockedUntil ? <DateTimeText value={blockedUntil} /> : "—"}</div>
            <div className="mt-1 text-sm text-neutral-600">Expired or invalid block dates are cleared automatically.</div>
          </div>
        </div>

        <StatusCard
          title={stateTitle}
          subtitle={stateText}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">What this means</div>
              <div className="mt-2 text-sm text-neutral-700 leading-7">
                {!adult.ok ? (
                  <>
                    You can browse public listings, but you cannot create listings, message, make offers, or complete transactions while this age-based restriction applies.
                  </>
                ) : isBlocked ? (
                  <>
                    Some marketplace actions may be limited until the restriction period ends or support reviews your account.
                  </>
                ) : (
                  <>
                    Your account currently appears clear for normal marketplace use.
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Why restrictions happen</div>
              <div className="mt-2 text-sm text-neutral-700 leading-7">
                Restrictions can be applied after repeated policy breaches such as prohibited items, safety risks, fraud, scams, or other serious marketplace misuse.
              </div>
            </div>
          </div>

          {!adult.ok ? (
            <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4 text-sm bd-ink2 leading-7">
              If you believe your age-related restriction is incorrect, contact support and include enough detail for a review.
            </div>
          ) : null}
        </StatusCard>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">Helpful links</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/legal/prohibited-items" className="bd-btn bd-btn-ghost text-center">
              Prohibited items
            </Link>
            <Link href="/help" className="bd-btn bd-btn-ghost text-center">
              Help
            </Link>
            <Link href="/support" className="bd-btn bd-btn-ghost text-center">
              Support and safety
            </Link>
            <Link href="/contact" className="bd-btn bd-btn-ghost text-center">
              Contact support
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
