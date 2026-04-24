import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import DateTimeText from "@/components/date-time-text";
import { getNotificationCounts } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function Pill(props: { tone?: "ok" | "warn"; children: React.ReactNode }) {
  const tone = props.tone ?? "ok";
  const cls =
    tone === "ok"
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-amber-100 text-amber-900 border border-amber-200";

  return (
    <span className={"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold " + cls}>
      {props.children}
    </span>
  );
}

function SurfaceCard(props: {
  title: string;
  subtitle?: string;
  tone?: "default" | "attention";
  children: React.ReactNode;
}) {
  const tone = props.tone ?? "default";
  const shell =
    tone === "attention"
      ? "rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm"
      : "rounded-3xl border border-black/10 bg-white p-5 shadow-sm";

  return (
    <div className={shell}>
      <div className="flex flex-col gap-1">
        <div className="text-sm font-extrabold bd-ink">{props.title}</div>
        {props.subtitle ? <div className="text-sm bd-ink2">{props.subtitle}</div> : null}
      </div>
      <div className="mt-4">{props.children}</div>
    </div>
  );
}

function ActionBtn(props: { href: string; kind?: "primary" | "ghost"; children: React.ReactNode }) {
  const kind = props.kind ?? "ghost";
  const cls = kind === "primary" ? "bd-btn bd-btn-primary" : "bd-btn bd-btn-ghost";
  return (
    <Link href={props.href} className={cls}>
      {props.children}
    </Link>
  );
}

function ActionLink(props: { href: string; children: React.ReactNode }) {
  return (
    <Link href={props.href} className="bd-link font-semibold">
      {props.children}
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/dashboard");

  const role = session.user.role;
  const isAdmin = role === "ADMIN";

  const adult = await requireAdult(session);
  const me = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: me },
    select: {
      id: true,
      emailVerified: true,
      isActive: true,
      ageVerified: true,
      phoneVerified: true,
      policyStrikes: true,
      policyBlockedUntil: true,
    },
  });
  if (!user) redirect("/auth/login?next=/dashboard");

  const counts = await getNotificationCounts(me);

  const now = Date.now();
  const blockedUntilMs = user.policyBlockedUntil ? new Date(user.policyBlockedUntil).getTime() : 0;
  const isBlocked = blockedUntilMs > now;

  const myListingsCount = await prisma.listing.count({
    where: { sellerId: me, status: { not: "DELETED" } },
  });

  const activeListingsCount = await prisma.listing.count({
    where: { sellerId: me, status: "ACTIVE" },
  });

  const soldListingsCount = await prisma.listing.count({
    where: { sellerId: me, status: "SOLD" },
  });

  const ordersAsBuyerCount = await prisma.order.count({
    where: { buyerId: me },
  });

  const watchlistCount = await prisma.watchlist.count({
    where: { userId: me },
  });

  const graceHours = 48;
  const cutoff = new Date(Date.now() - graceHours * 60 * 60 * 1000);

  const pendingBuyerFeedbackCount = await prisma.order.count({
    where: { buyerId: me, completedAt: { not: null, lt: cutoff }, buyerFeedbackAt: null },
  });

  const sinceTopOffers = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newTopOfferCount = await prisma.adminEvent.count({
    where: {
      type: "OFFER_NEW_TOP",
      userId: me,
      createdAt: { gte: sinceTopOffers },
    },
  });

  const needsEmail = false;
  const needsPhone = false;
  const needsAge = !user.ageVerified;

  const hasAttention =
    !adult.ok ||
    isBlocked ||
    pendingBuyerFeedbackCount > 0 ||
    newTopOfferCount > 0 ||
    needsEmail ||
    needsPhone ||
    needsAge;

  const attentionCount =
    (adult.ok ? 0 : 1) +
    (isBlocked ? 1 : 0) +
    (pendingBuyerFeedbackCount > 0 ? 1 : 0) +
    (newTopOfferCount > 0 ? 1 : 0) +
    (needsAge ? 1 : 0);

  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Dashboard</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">
                Your Bidra control center
              </h1>
              <div className="mt-2 text-sm bd-ink2 sm:text-base">
                Shortcuts, account status, marketplace activity, and anything that needs your attention.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionBtn href="/sell/new" kind="primary">Create a listing</ActionBtn>
              <ActionBtn href="/dashboard/listings">Manage listings</ActionBtn>
              <ActionBtn href="/watchlist">Watchlist</ActionBtn>
              <ActionBtn href="/messages">Messages</ActionBtn>
              <ActionBtn href="/orders">Orders</ActionBtn>
              {isAdmin ? <ActionBtn href="/admin">Admin</ActionBtn> : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Listings</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{myListingsCount}</div>
            <div className="mt-1 text-sm text-neutral-600">Across your seller account.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Active</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{activeListingsCount}</div>
            <div className="mt-1 text-sm text-neutral-600">Currently live in the marketplace.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Orders</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{ordersAsBuyerCount}</div>
            <div className="mt-1 text-sm text-neutral-600">As a buyer on Bidra.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Needs attention</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{attentionCount}</div>
            <div className="mt-1 text-sm text-neutral-600">Tasks or account items to review.</div>
          </div>
        </div>

        {counts.actionOrders > 0 ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 shadow-sm">
            <div className="font-semibold">Action required</div>
            <div className="mt-1">
              {counts.actionOrders} order(s) need your attention.
            </div>
            <div className="mt-2">
              <Link href="/orders" className="underline font-semibold">Review orders</Link>
            </div>
          </div>
        ) : null}

        {hasAttention ? (
          <SurfaceCard
            title="Needs attention"
            subtitle="Review anything that may block trust, selling, buying, or account access."
            tone="attention"
          >
            <div className="flex flex-col gap-2 text-sm">
              {!adult.ok ? (
                <div className="bd-ink2">
                  Your account is restricted. Visit{" "}
                  <Link href="/account/restrictions" className="bd-link font-semibold">
                    account restrictions
                  </Link>
                  .
                </div>
              ) : null}

              {isBlocked ? (
                <div className="bd-ink2">
                  Temporarily blocked until{" "}
                  <span className="font-semibold bd-ink">
                    {user.policyBlockedUntil ? <DateTimeText value={user.policyBlockedUntil} /> : "--"}
                  </span>
                  .
                </div>
              ) : null}

              {newTopOfferCount > 0 ? (
                <div>
                  <ActionLink href="/dashboard/listings">New top offers received ({newTopOfferCount})</ActionLink>
                </div>
              ) : null}

              {pendingBuyerFeedbackCount > 0 ? (
                <div>
                  <ActionLink href="/orders">Leave buyer feedback ({pendingBuyerFeedbackCount})</ActionLink>
                </div>
              ) : null}

              {needsAge ? (
                <div>
                  <ActionLink href="/profile">Complete age verification</ActionLink>
                </div>
              ) : null}
            </div>
          </SurfaceCard>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <SurfaceCard
            title="Account snapshot"
            subtitle="Quick trust and account health overview."
          >
            <div className="flex flex-wrap gap-2">
              <Pill tone={adult.ok ? "ok" : "warn"}>18+ gate: {adult.ok ? "OK" : "Restricted"}</Pill>
              <Pill tone={!isBlocked ? "ok" : "warn"}>Blocked: {isBlocked ? "Yes" : "No"}</Pill>
              <Pill tone={user.policyStrikes < 3 ? "ok" : "warn"}>Strikes: {user.policyStrikes}</Pill>
              <Pill tone={needsAge ? "warn" : "ok"}>Age verified: {needsAge ? "No" : "Yes"}</Pill>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Quick actions"
            subtitle="Jump straight into the most common marketplace tasks."
          >
            <div className="flex flex-wrap gap-2">
              <ActionBtn href="/sell/new" kind="primary">Create listing</ActionBtn>
              <ActionBtn href="/dashboard/listings">Manage listings</ActionBtn>
              <ActionBtn href="/watchlist">Watchlist</ActionBtn>
              <ActionBtn href="/messages">Messages</ActionBtn>
              <ActionBtn href="/orders">Orders</ActionBtn>
              <ActionBtn href="/listings">Browse marketplace</ActionBtn>
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <SurfaceCard
            title="Seller"
            subtitle="Manage listings, watch offer activity, and keep your seller profile active."
          >
            <div className="flex flex-wrap gap-2">
              <Pill>Listings: {myListingsCount}</Pill>
              <Pill>Active: {activeListingsCount}</Pill>
              <Pill>Completed: {soldListingsCount}</Pill>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm">
              <ActionLink href="/dashboard/listings">Manage my listings</ActionLink>
              <ActionLink href="/sell/new">Create a listing</ActionLink>
              <ActionLink href="/messages">Go to messages</ActionLink>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Buyer"
            subtitle="Track orders, browse listings, and stay on top of follow-up actions."
          >
            <div className="flex flex-wrap gap-2">
              <Pill>Orders: {ordersAsBuyerCount}</Pill>
              <Pill>Watchlist: {watchlistCount}</Pill>
              <Pill tone={pendingBuyerFeedbackCount === 0 ? "ok" : "warn"}>
                Feedback due: {pendingBuyerFeedbackCount}
              </Pill>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm">
              <ActionLink href="/orders">View orders</ActionLink>
              <ActionLink href="/watchlist">View watchlist</ActionLink>
              <ActionLink href="/listings">Browse listings</ActionLink>
              <ActionLink href="/messages">Open clarification threads</ActionLink>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </main>
  );
}
