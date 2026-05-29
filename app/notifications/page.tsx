export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import AccountNav from "@/components/account-nav";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getNotificationCounts } from "@/lib/notifications";
import { ReferencePage, appShell } from "@/components/marketplace-redesign";

function CountPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#D7E2F1] bg-white px-3 py-1 text-xs shadow-sm">
      <span className="text-[#607089]">{label}</span>
      <span className="font-extrabold text-[#07152E]">{value}</span>
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
      <div className={`h-full rounded-3xl border bg-white p-6 shadow-sm transition ${hasCount ? "border-blue-300 ring-2 ring-blue-100" : "border-[#D7E2F1]"}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-2xl font-extrabold tracking-tight bd-ink">{props.title}</div>
            <div className="mt-3 text-sm bd-ink2 leading-7">{props.children}</div>
          </div>

          <CountPill label={props.countLabel} value={props.count} />
        </div>

        <div className="mt-6 inline-flex bd-btn bd-btn-secondary text-center">
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
    <ReferencePage>
      <div className={appShell + " space-y-5 py-6 sm:py-8"}>
        <AccountNav active="updates" />
        <section className="bd-logged-in-hero">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">My Bidra</div>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight bd-ink sm:text-3xl">Updates</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Unread messages, order actions, and feedback reminders.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <CountPill label="Unread" value={counts.unreadThreads} />
              <CountPill label="Orders" value={counts.actionOrders} />
              <CountPill label="Feedback" value={counts.pendingFeedback} />
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <UpdateCard
            title="Messages"
            countLabel="Unread"
            count={counts.unreadThreads}
            href="/messages"
            action="Open inbox"
          >
            Reply to buyers and sellers, ask questions, and keep pickup or postage details in Bidra Messages.
          </UpdateCard>

          <UpdateCard
            title="Orders"
            countLabel="Sold"
            count={counts.actionOrders}
            href="/orders"
            action="Open orders"
          >
            Review orders, message the other person, and handle pickup, postage, or follow-up.
          </UpdateCard>
        </div>

        <Link href="/orders" className="block">
          <div className="rounded-3xl border border-[#D7E2F1] bg-white p-5 shadow-sm transition">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-lg font-extrabold bd-ink">Feedback</div>
                  <CountPill label="Open" value={counts.pendingFeedback} />
                </div>
                <div className="mt-2 text-sm bd-ink2">
                  Optional after handover. Feedback helps future buyers and sellers make better decisions.
                </div>
              </div>

              <div className="inline-flex w-fit bd-btn bd-btn-secondary text-center">
                View orders
              </div>
            </div>
          </div>
        </Link>

        {counts.total === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#C8D7EA] bg-[#F8FAFF] px-6 py-12 text-center shadow-sm">
            <div className="mx-auto w-full max-w-xl">
              <div className="text-xl font-extrabold text-[#0F172A]">You are all caught up</div>
              <div className="mt-2 text-sm text-[#526173]">
                New messages, orders, and optional feedback will appear here.
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ReferencePage>
  );
}

