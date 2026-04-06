#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $PSCommandPath
if ([string]::IsNullOrWhiteSpace($scriptRoot)) {
    throw 'This script must be run from a .ps1 file, not pasted into the console.'
}

$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )
    $dir = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $enc)
}

$orderPayPath = Join-Path $repoRoot 'app\orders\[id]\pay\page.tsx'
$dashboardPath = Join-Path $repoRoot 'app\dashboard\page.tsx'

$orderPay = @'
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function OrderPayRedirect({ params }: { params: { id: string } }) {
  const id = String(params?.id || "").trim();
  if (!id) redirect("/orders");
  redirect("/orders/" + id);
}
'@

$dashboard = @'
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

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bd-ink">
              Dashboard
            </h1>
            <div className="mt-1 text-sm bd-ink2">
              Shortcuts and anything that needs action.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionBtn href="/sell/new" kind="primary">Create a listing</ActionBtn>
            <ActionBtn href="/dashboard/listings">Manage listings</ActionBtn>
            <ActionBtn href="/messages">Messages</ActionBtn>
            <ActionBtn href="/orders">Orders</ActionBtn>
            {isAdmin ? <ActionBtn href="/admin">Admin</ActionBtn> : null}
          </div>
        </div>

        {counts.actionOrders > 0 ? (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <div className="font-semibold">Action required</div>
            <div className="mt-1">
              You have {counts.actionOrders} order(s) that need your attention.
            </div>
            <div className="mt-2">
              <Link href="/orders" className="underline font-semibold">Go to orders -&gt;</Link>
            </div>
          </div>
        ) : null}

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

                {false ? <div><ActionLink href="/profile">Verify your email</ActionLink></div> : null}
                {false ? <div><ActionLink href="/profile">Verify your phone</ActionLink></div> : null}
                {needsAge ? <div><ActionLink href="/profile">Complete age verification</ActionLink></div> : null}
              </div>
            </Card>
          </div>
        ) : null}

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
                  Overdue feedback (48h+): {pendingBuyerFeedbackCount}
                </Pill>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm">
                <ActionLink href="/orders">View orders</ActionLink>
                <ActionLink href="/listings">Browse listings</ActionLink>
                <ActionLink href="/messages">Open clarification threads</ActionLink>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
'@

Write-Utf8NoBom -Path $orderPayPath -Content $orderPay
Write-Utf8NoBom -Path $dashboardPath -Content $dashboard
Write-Host '[OK] chunk 3 cleanup and launch-truth patch applied'
