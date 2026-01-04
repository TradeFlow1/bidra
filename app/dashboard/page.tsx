import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function Pill(props: { tone?: "ok" | "warn"; children: React.ReactNode }) {
  const tone = props.tone ?? "ok";
  const cls =
    tone === "ok"
      ? "bg-green-100 text-green-800"
      : "bg-amber-100 text-amber-900";

  return (
    <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold " + cls}>
      {props.children}
    </span>
  );
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="bd-card p-5">
      <div className="text-xs font-bold uppercase tracking-wider bd-ink3">{props.title}</div>
      <div className="mt-3 bd-ink">{props.children}</div>
    </div>
  );
}

function ActionLink(props: { href: string; children: React.ReactNode }) {
  return (
    <Link className="bd-btn bd-btn-primary" href={props.href}>
      {props.children}
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/dashboard");

  const role = (session.user as any)?.role;
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

  const pendingBuyerFeedbackCount = await prisma.order.count({
    where: { buyerId: me, completedAt: { not: null }, buyerFeedbackAt: null },
  });

  const pendingSellerFeedbackCount = await prisma.order.count({
    where: { listing: { sellerId: me }, completedAt: { not: null }, sellerFeedbackAt: null },
  });

  const needsEmail = !user.emailVerified;
  const needsPhone = !user.phoneVerified;
  const needsAge = !user.ageVerified; // keep only if you still want this surfaced separately

  const hasAttention =
    !adult.ok || isBlocked || pendingBuyerFeedbackCount > 0 || pendingSellerFeedbackCount > 0 || needsEmail || needsPhone || needsAge;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[var(--bidra-bg)] text-[var(--bidra-fg)] px-4 py-10"><div className="mx-auto w-full max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard <span className="ml-2 text-sm font-semibold bd-ink2">(v2)</span></h1>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Link href="/admin" className="bd-btn bd-btn-primary">
              Admin
            </Link>
          ) : null}

          <Link href="/sell/new" className="bd-btn bd-btn-primary">
            Create listing
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Your status">
          <div className="flex flex-wrap gap-2">
            <Pill tone={adult.ok ? "ok" : "warn"}>18+ gate: {adult.ok ? "OK" : "Restricted"}</Pill>
            <Pill tone={!isBlocked ? "ok" : "warn"}>Blocked: {isBlocked ? "Yes" : "No"}</Pill>
            <Pill tone={user.policyStrikes < 3 ? "ok" : "warn"}>Strikes: {user.policyStrikes}</Pill>
          </div>

          {isBlocked ? (
            <div className="mt-3 text-sm text-amber-700">
              Temporarily blocked until{" "}
              <span className="font-semibold">
                {user.policyBlockedUntil ? new Date(user.policyBlockedUntil).toLocaleString() : "—"}
              </span>
              .
            </div>
          ) : null}

          {!adult.ok ? (
            <div className="mt-3 text-sm text-amber-700">
              Your account is restricted. Visit{" "}
              <Link href="/account/restrictions" className="bd-link font-semibold underline underline-offset-4">
                account restrictions
              </Link>
              .
            </div>
          ) : null}
        </Card>

        <Card title="Needs attention">
          {!hasAttention ? (
            <div className="text-sm bd-ink2">All good. No actions required right now.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingSellerFeedbackCount > 0 ? (
                <ActionLink href="/orders">Leave seller feedback ({pendingSellerFeedbackCount})</ActionLink>
              ) : null}

              {pendingBuyerFeedbackCount > 0 ? (
                <ActionLink href="/orders">Leave buyer feedback ({pendingBuyerFeedbackCount})</ActionLink>
              ) : null}

              {needsEmail ? <ActionLink href="/profile">Verify your email</ActionLink> : null}
              {needsPhone ? <ActionLink href="/profile">Verify your phone</ActionLink> : null}
              {needsAge ? <ActionLink href="/profile">Complete age verification</ActionLink> : null}

              {(!needsEmail && !needsPhone && !needsAge && pendingBuyerFeedbackCount === 0 && pendingSellerFeedbackCount === 0 && adult.ok && !isBlocked) ? (
                <div className="text-sm bd-ink2">No actions required.</div>
              ) : null}
            </div>
          )}
        </Card>

        <Card title="Seller actions">
          <div className="flex flex-wrap gap-2">
            <Pill>Listings: {myListingsCount}</Pill>
            <Pill>Active: {activeListingsCount}</Pill>
            <Pill>Sold: {soldListingsCount}</Pill>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <ActionLink href="/dashboard/listings">Manage my listings</ActionLink>
            <ActionLink href="/sell/new">Create a listing</ActionLink>
            <ActionLink href="/messages">Go to messages</ActionLink>
          </div>
        </Card>

        <Card title="Buyer actions">
          <div className="flex flex-wrap gap-2">
            <Pill>Orders: {ordersAsBuyerCount}</Pill>
            <Pill tone={(pendingBuyerFeedbackCount === 0) ? "ok" : "warn"}>Feedback due: {pendingBuyerFeedbackCount}</Pill>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <ActionLink href="/orders">View orders</ActionLink>
            <ActionLink href="/watchlist">Watchlist</ActionLink>
            <ActionLink href="/messages">Continue chats</ActionLink>
          </div>
        </Card>
      </div>
    </div></main>
  );
}
