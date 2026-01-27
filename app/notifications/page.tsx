export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, Badge } from "@/components/ui";
import { getNotificationCounts } from "@/lib/notifications";

export default async function NotificationsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) redirect("/auth/login?next=/notifications");

  const counts = await getNotificationCounts(user.id);

  return (
    <main className="bd-container py-10">
      <div className="container max-w-3xl">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Notifications</h1>
            <p className="mt-2 text-sm bd-ink2">A quick summary of what needs your attention.</p>
          </div>
          <div className="flex gap-2 items-center">
            <Badge>Total {counts.total}</Badge>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <Card className="bd-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold bd-ink">Messages</div>
                <div className="mt-1 text-sm bd-ink2">
                  Unread threads: <b>{counts.unreadThreads}</b>
                </div>
              </div>
              <Link href="/messages" className="bd-btn bd-btn-primary">Go to messages</Link>
            </div>
          </Card>

          <Card className="bd-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold bd-ink">Feedback</div>
                <div className="mt-1 text-sm bd-ink2">
                  Pending feedback tasks: <b>{counts.pendingFeedback}</b>
                </div>
                <div className="mt-2 text-xs bd-ink2">
                  If feedback is overdue, some actions may be temporarily blocked until it’s completed.
                </div>
              </div>
              <Link href="/orders" className="bd-btn bd-btn-primary">Go to orders</Link>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
