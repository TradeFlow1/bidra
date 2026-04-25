export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getNotificationCounts } from "@/lib/notifications";

function CountPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs shadow-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-extrabold text-neutral-950">{value}</span>
    </span>
  );
}

function UpdateCard(props: {
  title: string;
  countLabel: string;
  count: number;
  href: string;
  action: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  const hasCount = props.highlight === true && props.count > 0;

  return (
    <Link href={props.href} className="block">
      <div className={`h-full rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md ${hasCount ? "border-blue-300 ring-2 ring-blue-100" : "border-black/10"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-extrabold tracking-tight bd-ink">{props.title}</div>
            <div className="mt-3 text-sm bd-ink2 leading-7">{props.children}</div>
          </div>

          <CountPill label={props.countLabel} value={props.count} />
        </div>

        <div className="mt-6 inline-flex rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">
          {props.action}
        </div>
      </div>
    </Link>
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
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Updates</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Messages and orders</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Keep up with unread messages, sold items, and simple follow-up.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <CountPill label="Unread" value={counts.unreadThreads} />
              <CountPill label="Sold" value={counts.actionOrders} />
              <CountPill label="Feedback" value={counts.pendingFeedback} />
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <UpdateCard
            title="Messages"
            countLabel="Unread"
            count={counts.unreadThreads}
            href="/messages"
            action="Open inbox"
          >
            Reply to buyers and sellers, ask questions, and keep pickup or postage details on Bidra.
          </UpdateCard>

          <UpdateCard
            title="Orders"
            countLabel="Sold"
            count={counts.actionOrders}
            href="/orders"
            action="Open orders"
          >
            Review sold items, message the other person, and handle pickup, postage, or follow-up.
          </UpdateCard>
        </div>

        <Link href="/orders" className="block">
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-lg font-extrabold bd-ink">Feedback</div>
                  <CountPill label="Open" value={counts.pendingFeedback} />
                </div>
                <div className="mt-2 text-sm bd-ink2">
                  Optional after handover. Feedback helps future buyers and sellers make better decisions.
                </div>
              </div>

              <div className="inline-flex w-fit rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">
                View orders
              </div>
            </div>
          </div>
        </Link>

        {counts.total === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/15 bg-neutral-50 px-6 py-12 text-center shadow-sm">
            <div className="mx-auto max-w-xl">
              <div className="text-xl font-extrabold text-neutral-900">You are all caught up</div>
              <div className="mt-2 text-sm text-neutral-600">
                New messages, sold items, and optional feedback will appear here.
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
