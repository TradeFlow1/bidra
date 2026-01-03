import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function Pill(props: { ok?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold " +
        (props.ok ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900")
      }
    >
      {props.children}
    </span>
  );
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className="text-sm font-semibold">{props.title}</div>
      <div className="mt-3">{props.children}</div>
    </div>
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
      email: true,
      username: true,
      name: true,
      createdAt: true,
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
  const blockedUntil = user.policyBlockedUntil ? new Date(user.policyBlockedUntil).getTime() : 0;
  const isBlocked = blockedUntil > now;

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

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Link href="/admin" className="rounded-md border px-3 py-2 text-sm font-semibold hover:bg-black/5">
              Admin
            </Link>
          ) : null}
          <Link href="/sell/new" className="rounded-md border px-3 py-2 text-sm font-semibold hover:bg-black/5">
            Create listing
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Your status">
          <div className="flex flex-wrap gap-2">
            <Pill ok={adult.ok}>18+ gate: {adult.ok ? "OK" : "Restricted"}</Pill>
            <Pill ok={!isBlocked}>Blocked: {isBlocked ? "Yes" : "No"}</Pill>
            <Pill ok={user.policyStrikes < 3}>Strikes: {user.policyStrikes}</Pill>
            <Pill ok={user.emailVerified}>Email verified: {user.emailVerified ? "Yes" : "No"}</Pill>
            <Pill ok={user.ageVerified}>Age verified: {user.ageVerified ? "Yes" : "No"}</Pill>
            <Pill ok={user.phoneVerified}>Phone verified: {user.phoneVerified ? "Yes" : "No"}</Pill>
            <Pill ok={user.isActive}>Active: {user.isActive ? "Yes" : "No"}</Pill>
          </div>

          {!adult.ok ? (
            <div className="mt-3 text-sm text-amber-900">
              Your account is restricted. Visit{" "}
              <Link href="/account/restrictions" className="underline">
                account restrictions
              </Link>
              .
            </div>
          ) : null}

          {isBlocked ? (
            <div className="mt-3 text-sm text-amber-900">
              Temporarily blocked until{" "}
              <span className="font-semibold">
                {user.policyBlockedUntil ? new Date(user.policyBlockedUntil).toLocaleString() : "—"}
              </span>
              .
            </div>
          ) : null}
        </Card>

        <Card title="Quick actions">
          <div className="flex flex-col gap-2 text-sm">
            <Link className="rounded-md border px-3 py-2 hover:bg-black/5" href="/profile">
              Account settings
            </Link>
            <Link className="rounded-md border px-3 py-2 hover:bg-black/5" href="/messages">
              Messages
            </Link>
            <Link className="rounded-md border px-3 py-2 hover:bg-black/5" href="/orders">
              Orders
            </Link>
            <Link className="rounded-md border px-3 py-2 hover:bg-black/5" href="/watchlist">
              Watchlist
            </Link>
          </div>
        </Card>

        <Card title="Seller overview">
          <div className="flex flex-wrap gap-2">
            <Pill ok={true}>Listings: {myListingsCount}</Pill>
            <Pill ok={true}>Active: {activeListingsCount}</Pill>
            <Pill ok={true}>Sold: {soldListingsCount}</Pill>
            <Pill ok={pendingSellerFeedbackCount === 0}>
              Feedback due: {pendingSellerFeedbackCount}
            </Pill>
          </div>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link className="rounded-md border px-3 py-2 hover:bg-black/5" href="/dashboard/listings">
              Manage my listings
            </Link>
            <Link className="rounded-md border px-3 py-2 hover:bg-black/5" href="/sell/new">
              Create a listing
            </Link>
          </div>
        </Card>

        <Card title="Buyer overview">
          <div className="flex flex-wrap gap-2">
            <Pill ok={true}>Orders: {ordersAsBuyerCount}</Pill>
            <Pill ok={pendingBuyerFeedbackCount === 0}>
              Feedback due: {pendingBuyerFeedbackCount}
            </Pill>
          </div>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link className="rounded-md border px-3 py-2 hover:bg-black/5" href="/orders">
              View orders
            </Link>
            <Link className="rounded-md border px-3 py-2 hover:bg-black/5" href="/messages">
              Continue chats
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
