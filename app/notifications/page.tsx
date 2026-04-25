export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, Badge } from "@/components/ui";
import { getNotificationCounts } from "@/lib/notifications";

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs shadow-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-extrabold text-neutral-950">{value}</span>
    </div>
  );
}

function StatusChip(props: {
  active: boolean;
  activeText: string;
  idleText: string;
  tone?: "blue" | "yellow" | "neutral";
}) {
  const tone = props.tone ?? "neutral";

  if (!props.active) {
    return (
      <span className="inline-flex items-center rounded-full border border-black/10 bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
        {props.idleText}
      </span>
    );
  }

  if (tone === "yellow") {
    return (
      <span className="inline-flex items-center rounded-full border border-[var(--bidra-yellow)]/30 bg-[var(--bidra-yellow)]/20 px-2 py-0.5 text-[10px] font-extrabold text-[var(--bidra-ink)]">
        {props.activeText}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-[var(--bidra-blue)]/30 bg-[var(--bidra-blue)]/15 px-2 py-0.5 text-[10px] font-extrabold text-[var(--bidra-ink)]">
      {props.activeText}
    </span>
  );
}

export default async function NotificationsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) redirect("/auth/login?next=/notifications");

  const counts = await getNotificationCounts(user.id);

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Notifications</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Your action center</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Quick access to unread messages, order actions, and feedback tasks that need attention.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge>Total {counts.total}</Badge>
              <StatPill label="Unread threads" value={counts.unreadThreads} />
              <StatPill label="Feedback tasks" value={counts.pendingFeedback} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Link href="/messages" className="block">
            <Card className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-extrabold bd-ink">Messages</div>
                    <StatusChip
                      active={counts.unreadThreads > 0}
                      activeText={`${counts.unreadThreads} unread`}
                      idleText="All caught up"
                      tone="blue"
                    />
                  </div>

                  <div className="mt-2 text-sm bd-ink2">
                    Open your inbox and reply quickly to keep deals moving.
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="bd-btn bd-btn-primary">Open inbox</span>
                  <span className="text-[11px] bd-ink2">Go to /messages -&gt;</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/orders" className="block">
            <Card className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-extrabold bd-ink">Orders</div>
                    <StatusChip
                      active={counts.actionOrders > 0}
                      activeText={`${counts.actionOrders} need action`}
                      idleText="No action needed"
                      tone="blue"
                    />
                  </div>

                  <div className="mt-2 text-sm bd-ink2">
                    Open sold orders, message the other person, and handle any follow-up.
                  </div>

                  <div className="mt-2 text-xs bd-ink2">
                    This is the fastest place to continue order actions without relying on email.
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="bd-btn bd-btn-primary">Open orders</span>
                  <span className="text-[11px] bd-ink2">Go to /orders -&gt;</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/orders" className="block sm:col-span-2 xl:col-span-1">
            <Card className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-extrabold bd-ink">Feedback</div>
                    <StatusChip
                      active={counts.pendingFeedback > 0}
                      activeText={`${counts.pendingFeedback} pending`}
                      idleText="No tasks"
                      tone="yellow"
                    />
                  </div>

                  <div className="mt-2 text-sm bd-ink2">
                    Leave quick feedback on completed orders to build marketplace trust.
                  </div>

                  <div className="mt-2 text-xs bd-ink2">
                    If feedback tasks are overdue, some buyer actions may be temporarily blocked until they are completed.
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="bd-btn bd-btn-primary">View orders</span>
                  <span className="text-[11px] bd-ink2">Go to /orders -&gt;</span>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {counts.total === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/15 bg-neutral-50 px-6 py-12 text-center shadow-sm">
            <div className="mx-auto max-w-xl">
              <div className="text-xl font-extrabold text-neutral-900">You are all caught up</div>
              <div className="mt-2 text-sm text-neutral-600">
                When something needs your attention, it will show up here.
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
