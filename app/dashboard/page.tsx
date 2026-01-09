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

function Card(props: { title: string; tone?: "default" | "attention"; children: React.ReactNode }) {
  const tone = props.tone ?? "default";
  const shell =
    tone === "attention"
      ? "bd-card p-5 border border-amber-200 bg-amber-50/40"
      : "bd-card p-5";

  return (
    <div className={shell}>
      <div className="bd-section-title">{props.title}</div>
      <div className="mt-3">{props.children}</div>
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

  const sinceTopOffers = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newTopOfferCount = await prisma.adminEvent.count({
    where: {
      type: "OFFER_NEW_TOP",
      userId: me,
      createdAt: { gte: sinceTopOffers },
    },
  });


  const needsEmail = false; // STEP 1D: email verification disabled (no fake UX)
  const needsPhone = !user.phoneVerified;
  const needsAge = !user.ageVerified;

  const hasAttention =
    !adult.ok ||
    isBlocked ||
    pendingBuyerFeedbackCount > 0 ||
    pendingSellerFeedbackCount > 0 ||
    newTopOfferCount > 0 ||
    needsEmail ||
    needsPhone ||
    needsAge;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bd-ink">
              Dashboard
            </h1>
            <div className="mt-1 text-sm bd-ink2">
              Your shortcuts, status, and anything that needs action.
            </div>
          </div>

          {/* Primary actions bar */}
          <div className="flex flex-wrap gap-2">
            <ActionBtn href="/sell/new" kind="primary">Create a listing</ActionBtn>
            <ActionBtn href="/dashboard/listings">Manage listings</ActionBtn>
            <ActionBtn href="/messages">Messages</ActionBtn>
            <ActionBtn href="/orders">Orders</ActionBtn>
            {isAdmin ? <ActionBtn href="/admin">Admin</ActionBtn> : null}
          </div>
        </div>

        {/* Attention (only render if needed) */}
        {hasAttention ? (
          <div className="mt-6">
            <Card title="Needs attention" tone="attention">
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
                      {user.policyBlockedUntil ? new Date(user.policyBlockedUntil).toLocaleString() : "—"}
                    </span>
                    .
                  </div>
                ) : null}

                {pendingSellerFeedbackCount > 0 ? (
                  <div>
                    <ActionLink href="/orders">Leave seller feedback ({pendingSellerFeedbackCount})</ActionLink>
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

                {false ? <div><ActionLink href="/profile">Verify your email</ActionLink></div> : null}
                {needsPhone ? <div><ActionLink href="/profile">Verify your phone</ActionLink></div> : null}
                {needsAge ? <div><ActionLink href="/profile">Complete age verification</ActionLink></div> : null}
              </div>
            </Card>
          </div>
        ) : null}

        {/* Snapshot + Seller/Buyer */}
        <div className="mt-6 grid gap-4">
          <Card title="Account snapshot">
            <div className="flex flex-wrap gap-2">
              <Pill tone={adult.ok ? "ok" : "warn"}>18+ gate: {adult.ok ? "OK" : "Restricted"}</Pill>
              <Pill tone={!isBlocked ? "ok" : "warn"}>Blocked: {isBlocked ? "Yes" : "No"}</Pill>
              <Pill tone={user.policyStrikes < 3 ? "ok" : "warn"}>Strikes: {user.policyStrikes}</Pill>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Seller">
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
            </Card>

            <Card title="Buyer">
              <div className="flex flex-wrap gap-2">
                <Pill>Orders: {ordersAsBuyerCount}</Pill>
                <Pill tone={pendingBuyerFeedbackCount === 0 ? "ok" : "warn"}>
                  Feedback due: {pendingBuyerFeedbackCount}
                </Pill>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm">
                <ActionLink href="/orders">View orders</ActionLink>
                <ActionLink href="/watchlist">Watchlist</ActionLink>
                <ActionLink href="/messages">Continue chats</ActionLink>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
