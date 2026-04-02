export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, Badge } from "@/components/ui";
import { getNotificationCounts } from "@/lib/notifications";

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
      <span className="bd-ink2">{label}</span>
      <span className="font-extrabold bd-ink">{value}</span>
    </div>
  );
}

export default async function NotificationsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) redirect("/auth/login?next=/notifications");

  const counts = await getNotificationCounts(user.id);

  return (
    <main className="bd-container py-10">
      <div className="container max-w-4xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Notifications</h1>
            <p className="mt-2 text-sm bd-ink2">Quick actions for what needs your attention.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>Total {counts.total}</Badge>
            <StatPill label="Unread threads" value={counts.unreadThreads} />
            <StatPill label="Feedback tasks" value={counts.pendingFeedback} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/messages" className="block">
            <Card className="bd-card p-5 transition hover:shadow-sm hover:bg-black/[0.02]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-extrabold bd-ink">Messages</div>
                    {counts.unreadThreads > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-[var(--bidra-blue)]/30 bg-[var(--bidra-blue)]/15 px-2 py-0.5 text-[10px] font-extrabold text-[var(--bidra-ink)]">
                        {counts.unreadThreads} unread
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold bd-ink2">
                        All caught up
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-sm bd-ink2">
                    Open your inbox and reply quickly to keep deals moving.
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="bd-btn bd-btn-primary">Open inbox</span>
                  <span className="text-[11px] bd-ink2">Go to /messages →</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/orders" className="block">
            <Card className="bd-card p-5 transition hover:shadow-sm hover:bg-black/[0.02]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-extrabold bd-ink">Orders</div>
                    {counts.actionOrders > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-[var(--bidra-blue)]/30 bg-[var(--bidra-blue)]/15 px-2 py-0.5 text-[10px] font-extrabold text-[var(--bidra-ink)]">
                        {counts.actionOrders} need action
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold bd-ink2">
                        No action needed
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-sm bd-ink2">
                    Open orders that need pickup scheduling or confirmation.
                  </div>

                  <div className="mt-2 text-xs bd-ink2">
                    This is the fastest place to continue order actions without relying on email.
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="bd-btn bd-btn-primary">Open orders</span>
                  <span className="text-[11px] bd-ink2">Go to /orders →</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/orders" className="block">
            <Card className="bd-card p-5 transition hover:shadow-sm hover:bg-black/[0.02]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-extrabold bd-ink">Feedback</div>
                    {counts.pendingFeedback > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-[var(--bidra-yellow)]/30 bg-[var(--bidra-yellow)]/20 px-2 py-0.5 text-[10px] font-extrabold text-[var(--bidra-ink)]">
                        {counts.pendingFeedback} pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold bd-ink2">
                        No tasks
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-sm bd-ink2">
                    Leave quick feedback on completed orders to build trust.
                  </div>

                  <div className="mt-2 text-xs bd-ink2">
                    Note: If your feedback tasks are overdue, some buyer actions may be temporarily blocked until it’s completed.
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="bd-btn bd-btn-primary">View orders</span>
                  <span className="text-[11px] bd-ink2">Go to /orders →</span>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {counts.total === 0 ? (
          <div className="mt-6 bd-card p-5">
            <div className="text-sm bd-ink">
              You’re all caught up.
            </div>
            <div className="mt-1 text-sm bd-ink2">
              When something needs your attention, it will show up here.
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
