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

$rescheduleUiPath = Join-Path $repoRoot 'app\orders\[id]\reschedule-request.tsx'
$rescheduleApiPath = Join-Path $repoRoot 'app\api\orders\[id]\reschedule-request\route.ts'
$pickupOptionsApiPath = Join-Path $repoRoot 'app\api\orders\[id]\pickup\options\route.ts'
$pickupSelectApiPath = Join-Path $repoRoot 'app\api\orders\[id]\pickup\select\route.ts'
$orderPagePath = Join-Path $repoRoot 'app\orders\[id]\page.tsx'
$adminEventsPath = Join-Path $repoRoot 'app\admin\events\page.tsx'
$adminResolvePath = Join-Path $repoRoot 'app\api\admin\orders\reschedule-request\resolve\route.ts'

$rescheduleUi = @'
"use client";

import { useMemo, useState } from "react";

const REASONS = [
  { value: "RUNNING_LATE", label: "Running late" },
  { value: "CANNOT_MAKE_TIME", label: "Cannot make this time" },
  { value: "NEED_ANOTHER_DAY", label: "Need another day" },
  { value: "AVAILABILITY_CHANGED", label: "Availability changed" },
  { value: "OTHER", label: "Other" }
];

export default function RescheduleRequest({ orderId }: { orderId: string }) {
  const [reasonCode, setReasonCode] = useState<string>(REASONS[0].value);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const selectedLabel = useMemo(function () {
    const match = REASONS.find(function (item) { return item.value === reasonCode; });
    return match ? match.label : "Other";
  }, [reasonCode]);

  async function submit() {
    setLoading(true);
    setError(null);
    setOk(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/reschedule-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonCode: reasonCode,
          note: note
        })
      });

      const data = await res.json().catch(function () { return {}; });
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Unable to request a different pickup time.");
      }

      setOk(data.message || "Reschedule request submitted.");
      setNote("");
    } catch (e: any) {
      setError(e && e.message ? e.message : "Unable to request a different pickup time.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="text-sm font-semibold text-amber-900">Need a different pickup time?</div>
      <div className="mt-1 text-xs text-amber-900">
        Request a change here. The current pickup time still applies until a new time is chosen in the order.
      </div>

      <div className="mt-3 grid gap-2">
        {REASONS.map(function (item) {
          const active = item.value === reasonCode;
          return (
            <button
              key={item.value}
              type="button"
              className={
                "rounded-xl border px-4 py-3 text-left text-sm transition " +
                (active
                  ? "border-amber-500 bg-white text-amber-950"
                  : "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300")
              }
              onClick={function () { setReasonCode(item.value); }}
              disabled={loading}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <textarea
        className="bd-input mt-3 min-h-[96px] w-full"
        value={note}
        onChange={function (e) { setNote(e.target.value); }}
        placeholder={"Optional note about the change: " + selectedLabel}
      />

      <button
        type="button"
        className="bd-btn bd-btn-primary mt-3"
        disabled={loading}
        onClick={submit}
      >
        {loading ? "Submitting..." : "Request a different time"}
      </button>

      {error ? <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
      {ok ? <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{ok}</div> : null}
    </div>
  );
}
'@

$rescheduleApi = @'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import { OrderStatus } from "@prisma/client";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const orderId = String(ctx && ctx.params ? ctx.params.id : "").trim();
    if (!orderId) return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });

    const gate = await requireAdult();
    if (!gate.ok) return NextResponse.json({ ok: false, error: gate.reason }, { status: gate.status });
    const userId = String(gate.dbUser && gate.dbUser.id ? gate.dbUser.id : "");
    if (!userId) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

    const body = await req.json().catch(function () { return {}; });
    const reasonCode = String(body && body.reasonCode ? body.reasonCode : "").trim().toUpperCase();
    const note = String(body && body.note ? body.note : "").trim();

    const allowed = ["RUNNING_LATE", "CANNOT_MAKE_TIME", "NEED_ANOTHER_DAY", "AVAILABILITY_CHANGED", "OTHER"];
    if (allowed.indexOf(reasonCode) -lt 0) {
      return NextResponse.json({ ok: false, error: "Choose a valid reschedule reason." }, { status: 400 });
    }

    const reasonText = note ? (reasonCode + ": " + note) : reasonCode;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true },
    });

    if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

    const buyerId = String(order.buyerId || "");
    const sellerId = String(order.listing && order.listing.sellerId ? order.listing.sellerId : "");
    const isBuyer = userId === buyerId;
    const isSeller = userId === sellerId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 });
    }

    if (order.outcome === "COMPLETED" || order.outcome === "CANCELLED") {
      return NextResponse.json({ ok: false, error: "Order cannot be changed in its current state." }, { status: 409 });
    }

    if (order.status !== OrderStatus.PICKUP_SCHEDULED) {
      return NextResponse.json({ ok: false, error: "Reschedule requests are only available after pickup has been scheduled." }, { status: 409 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        rescheduleRequestedAt: new Date(),
        rescheduleRequestedByRole: isBuyer ? "BUYER" : "SELLER",
        rescheduleReason: reasonText,
        rescheduleResolvedAt: null,
        pickupOptions: isSeller ? null : order.pickupOptions,
        pickupOptionsSentAt: isSeller ? null : order.pickupOptionsSentAt,
        pickupOptionSelectedAt: isSeller ? null : order.pickupOptionSelectedAt,
      },
    });

    await prisma.adminEvent.create({
      data: {
        type: "ORDER_RESCHEDULE_REQUESTED",
        userId: userId,
        orderId: order.id,
        data: {
          listingId: order.listingId ?? null,
          buyerId: buyerId || null,
          sellerId: sellerId || null,
          requestedByRole: isBuyer ? "BUYER" : "SELLER",
          currentScheduledAt: order.pickupScheduledAt ?? null,
          reasonCode: reasonCode,
          reason: reasonText,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      order: updated,
      message: isBuyer
        ? "Reschedule request sent. The seller needs to post replacement pickup options. The current pickup time still applies until a new time is chosen."
        : "Reschedule request recorded. Post replacement pickup options now. The current pickup time still applies until the buyer chooses a new time."
    });
  } catch (e: any) {
    console.error("order.reschedule-request failed", e);
    return NextResponse.json({ ok: false, error: "Unable to record reschedule request." }, { status: 500 });
  }
}
'@

$pickupOptionsApi = @'
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { listing: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.listing?.sellerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const options = body ? body.options : null;

  if (!options || !Array.isArray(options) || options.length !== 3) {
    return NextResponse.json({ ok: false, error: "Provide exactly 3 pickup options." }, { status: 400 });
  }

  const normalized = options.map(function (v: unknown) { return String(v || "").trim(); });
  if (normalized.some(function (v: string) { return !v; })) {
    return NextResponse.json({ ok: false, error: "Pickup options cannot be blank." }, { status: 400 });
  }

  const unique = Array.from(new Set(normalized));
  if (unique.length !== 3) {
    return NextResponse.json({ ok: false, error: "Pickup options must be different." }, { status: 400 });
  }

  const times = unique.map(function (v: string) { return new Date(v).getTime(); });
  const now = Date.now();

  if (times.some(function (t: number) { return !Number.isFinite(t) || t <= now; })) {
    return NextResponse.json({ ok: false, error: "Pickup options must be in the future." }, { status: 400 });
  }

  const sorted = times.slice().sort(function (a: number, b: number) { return a - b; });
  for (let i = 1; i < sorted.length; i += 1) {
    if ((sorted[i] - sorted[i - 1]) < (60 * 60 * 1000)) {
      return NextResponse.json({ ok: false, error: "Leave at least 1 hour between pickup options." }, { status: 400 });
    }
  }

  const isReschedulePending = !!order.rescheduleRequestedAt;

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      pickupOptions: unique,
      pickupOptionsSentAt: new Date(),
      pickupOptionSelectedAt: isReschedulePending ? null : order.pickupOptionSelectedAt,
      status: isReschedulePending ? "PICKUP_SCHEDULED" : "PICKUP_REQUIRED",
    },
  });

  try {
    await prisma.adminEvent.create({
      data: {
        type: isReschedulePending ? "ORDER_RESCHEDULE_OPTIONS_POSTED" : "ORDER_PICKUP_OPTIONS_POSTED",
        userId: String(user.id),
        orderId: order.id,
        data: {
          listingId: order.listingId ?? null,
          buyerId: order.buyerId ?? null,
          sellerId: order.listing?.sellerId ?? null,
          options: unique,
        },
      },
    });
  } catch (_auditErr) {}

  if (order.buyerId) {
    const buyer = await prisma.user.findUnique({ where: { id: order.buyerId } });
    if (buyer?.email) {
      await sendEmail({
        to: buyer.email,
        subject: isReschedulePending ? "Replacement pickup options available" : "Pickup options available",
        text:
          (isReschedulePending
            ? "The seller has posted replacement pickup options for your order.\n\nChoose a new time here:\n"
            : "The seller has provided pickup options for your order.\n\nChoose a time here:\n") +
          (process.env.NEXTAUTH_URL || "https://www.bidra.com.au") +
          "/orders/" + order.id
      });
    }
  }

  return NextResponse.json({ ok: true, order: updated });
}
'@

$pickupSelectApi = @'
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { listing: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.buyerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status !== "PICKUP_REQUIRED" && order.status !== "PICKUP_SCHEDULED") {
    return NextResponse.json({ error: "Pickup selection is not available for this order status." }, { status: 409 });
  }

  const body = await req.json();
  const selectedAt = body ? body.selectedAt : null;

  if (!selectedAt || typeof selectedAt !== "string") {
    return NextResponse.json({ error: "Invalid selectedAt" }, { status: 400 });
  }

  const options = Array.isArray(order.pickupOptions) ? order.pickupOptions : [];
  const match = options.find((x) => String(x) === selectedAt);

  if (!match) {
    return NextResponse.json({ error: "Selected option is not valid" }, { status: 400 });
  }

  const isReschedulePending = !!order.rescheduleRequestedAt;

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      pickupScheduledAt: new Date(selectedAt),
      pickupOptionSelectedAt: new Date(),
      pickupScheduleLockedAt: new Date(),
      status: "PICKUP_SCHEDULED",
      rescheduleResolvedAt: isReschedulePending ? new Date() : order.rescheduleResolvedAt,
      rescheduleRequestedAt: isReschedulePending ? null : order.rescheduleRequestedAt,
      rescheduleRequestedByRole: isReschedulePending ? null : order.rescheduleRequestedByRole,
      rescheduleReason: isReschedulePending ? null : order.rescheduleReason,
      rescheduleCount: isReschedulePending ? { increment: 1 } : order.rescheduleCount,
    },
  });

  try {
    await prisma.adminEvent.create({
      data: {
        type: isReschedulePending ? "ORDER_RESCHEDULE_CONFIRMED" : "ORDER_PICKUP_OPTION_SELECTED",
        userId: String(user.id),
        orderId: order.id,
        data: {
          listingId: order.listingId ?? null,
          buyerId: order.buyerId ?? null,
          sellerId: order.listing?.sellerId ?? null,
          selectedAt: selectedAt,
        },
      },
    });
  } catch (e) {
    console.warn("[ADMIN_AUDIT] Failed to log pickup selection", e);
  }

  if (order.listing?.sellerId) {
    const seller = await prisma.user.findUnique({ where: { id: order.listing.sellerId } });
    if (seller?.email) {
      await sendEmail({
        to: seller.email,
        subject: isReschedulePending ? "Replacement pickup time confirmed" : "Pickup time confirmed",
        text:
          (isReschedulePending
            ? "The buyer has selected a replacement pickup time.\n\nView details here:\n"
            : "The buyer has selected a pickup time.\n\nView details here:\n") +
          (process.env.NEXTAUTH_URL || "https://www.bidra.com.au") +
          "/orders/" + order.id
      });
    }
  }

  return NextResponse.json({ ok: true, order: updated });
}
'@

$orderPage = @'
import Link from "next/link";
import SellerConfirmReceived from "./seller-confirm-received";
import SellerPickupOptionsForm from "./seller-pickup-options-form";
import BuyerPickupSelect from "./buyer-pickup-select";
import RescheduleRequest from "./reschedule-request";
import NoShowReport from "./no-show-report";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";
import SafetyCallout from "../../../components/safety-callout";
import OrderStatusTimeline from "../../../components/order-status-timeline";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect(`/auth/login?next=/orders/${params.id}`);

  const gate = await requireAdult(session);
  if (!gate.ok) redirect("/account/restrictions");

  const orderId = params.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { listing: true },
  });

  if (!order) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-4xl">
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Order</h1>
            <p className="mt-2 text-sm bd-ink2">Order not found.</p>
            <div className="mt-5">
              <Link className="bd-btn bd-btn-ghost text-center" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (order.buyerId !== user.id && order.listing?.sellerId !== user.id) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-4xl">
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Order</h1>
            <p className="mt-2 text-sm bd-ink2">You do not have access to this order.</p>
            <div className="mt-5">
              <Link className="bd-btn bd-btn-ghost text-center" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const listingHref = `/listings/${order.listingId}`;
  const feedbackHref = `/orders/${order.id}/feedback`;
  const isBuyer = order.buyerId === user.id;
  const isSeller = order.listing?.sellerId === user.id;
  const canLeave =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !order.buyerFeedbackAt) || (isSeller && !order.sellerFeedbackAt));
  const alreadyLeft =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !!order.buyerFeedbackAt) || (isSeller && !!order.sellerFeedbackAt));
  const pickupOptions = Array.isArray(order.pickupOptions)
    ? order.pickupOptions.map(function (x) { return String(x); })
    : [];
  const reschedulePending = !!order.rescheduleRequestedAt;
  const rescheduleRequestedByRole = order.rescheduleRequestedByRole ? String(order.rescheduleRequestedByRole) : null;
  const rescheduleReason = order.rescheduleReason ? String(order.rescheduleReason) : null;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-4xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Order</h1>
              <div className="text-sm bd-ink2 mt-1">
                <Badge>{order.outcome === "COMPLETED" ? "COMPLETED" : order.status}</Badge>{" "}
                <span className="ml-2">Created <DateTimeText value={order.createdAt} /></span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/orders" className="bd-btn bd-btn-primary text-center">Orders</Link>
              <Link href={listingHref} className="bd-btn bd-btn-primary text-center">View listing</Link>
              {canLeave ? (
                <Link href={feedbackHref} className="bd-btn bd-btn-primary text-center">
                  Leave feedback
                </Link>
              ) : null}
              {alreadyLeft ? (
                <span className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/5 px-4 py-2.5 text-sm font-semibold bd-ink">
                  Feedback submitted
                </span>
              ) : null}
            </div>
          </div>

          <Card className="bd-card p-6">
            <div className="grid gap-3">
              <div className="text-sm bd-ink2">
                Order: <code className="font-mono">{order.id}</code>
              </div>

              <div className="text-lg font-extrabold">
                {order.listing?.title ?? "Listing"}
              </div>

              <div className="text-sm bd-ink2">
                Amount: <b>${(order.amount / 100).toFixed(2)}</b> AUD
              </div>

              <OrderStatusTimeline status={order.status} outcome={order.outcome} className="mt-3" />

              {order.pickupScheduledAt ? (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
                  <div className="font-semibold">Current pickup time</div>
                  <div className="mt-1">{new Date(order.pickupScheduledAt).toLocaleString()}</div>
                  {reschedulePending ? (
                    <div className="mt-2 text-xs text-green-900">
                      This remains the binding pickup time until a replacement time is chosen.
                    </div>
                  ) : null}
                </div>
              ) : null}

              {reschedulePending ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <div className="font-semibold">Reschedule in progress</div>
                  <div className="mt-1">
                    Requested by: <b>{rescheduleRequestedByRole || "Unknown"}</b>
                  </div>
                  {rescheduleReason ? <div className="mt-1">Reason: {rescheduleReason}</div> : null}
                  {isBuyer ? (
                    <div className="mt-2">
                      {pickupOptions.length ? "Replacement pickup options are ready below. Choose one to update the schedule." : "Waiting for the seller to post replacement pickup options."}
                    </div>
                  ) : null}
                  {isSeller ? (
                    <div className="mt-2">
                      Post replacement pickup options below so the buyer can choose a new time.
                    </div>
                  ) : null}
                </div>
              ) : null}

              {(order.status === "PICKUP_SCHEDULED" && isBuyer && order.outcome !== "COMPLETED") ? (
                <>
                  <RescheduleRequest orderId={order.id} />
                  <NoShowReport orderId={order.id} />
                </>
              ) : null}

              {(order.status === "PICKUP_REQUIRED" && isBuyer) ? (
                <div className="pt-2">
                  <SafetyCallout title="Safety">
                    <ul className="list-disc pl-5">
                      <li>Keep communication on Bidra via Messages for clarification only.</li>
                      <li>Wait for the seller to provide pickup options, then choose one in-app.</li>
                      <li>If anything feels suspicious, stop and report it.</li>
                    </ul>
                  </SafetyCallout>

                  <div className="mt-3 rounded-xl border border-black/10 bg-white/5 px-4 py-3 text-sm bd-ink2">
                    {pickupOptions.length ? "Choose one of the seller-defined pickup options below." : "Waiting for seller pickup availability."}
                  </div>
                  {(order.status === "PICKUP_REQUIRED" && isBuyer && pickupOptions.length > 0) ? (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                      <div className="font-semibold">Action required</div>
                      <div className="mt-1">Choose a pickup time to complete scheduling.</div>
                    </div>
                  ) : null}
                  <BuyerPickupSelect orderId={order.id} options={pickupOptions} />
                </div>
              ) : null}

              {(order.status === "PICKUP_SCHEDULED" && isBuyer && reschedulePending && pickupOptions.length > 0) ? (
                <div className="pt-2">
                  <BuyerPickupSelect orderId={order.id} options={pickupOptions} />
                </div>
              ) : null}

              {order.listing?.sellerId === user.id && order.status === "PICKUP_REQUIRED" ? (
                <div className="pt-2">
                  <SafetyCallout title="Next step">
                    <ul className="list-disc pl-5">
                      <li>This is a binding order.</li>
                      <li>After purchase, provide pickup options here so the buyer can choose in-app.</li>
                    </ul>
                  </SafetyCallout>

                  {(order.status === "PICKUP_REQUIRED" && isSeller) ? (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                      <div className="font-semibold">Action required</div>
                      <div className="mt-1">Add pickup options here after the sale. The buyer will choose one in-app to lock the schedule.</div>
                    </div>
                  ) : null}
                  <SellerPickupOptionsForm orderId={order.id} />
                </div>
              ) : null}

              {(order.status === "PICKUP_SCHEDULED" && isSeller && reschedulePending) ? (
                <div className="pt-2">
                  <SellerPickupOptionsForm orderId={order.id} />
                </div>
              ) : null}

              {order.listing?.sellerId === user.id && order.status === "PICKUP_SCHEDULED" && order.outcome !== "COMPLETED" ? (
                <>
                  <SellerConfirmReceived orderId={order.id} />
                  <NoShowReport orderId={order.id} />
                  <RescheduleRequest orderId={order.id} />
                </>
              ) : null}

              <div className="pt-2">
                <div className="text-xs bd-ink2">
                  <Card className="bd-card p-6">
                    <div className="grid gap-2">
                      <div className="text-sm font-extrabold bd-ink">What happens next</div>
                      {order.status === "PICKUP_REQUIRED" ? (
                        <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                          <li><b>Pickup options</b> are provided by the seller after purchase.</li>
                          <li>The buyer then chooses one option and the schedule is locked. Messages do not override the scheduled flow.</li>
                          <li>Keep communication on Bidra in <Link className="bd-link font-semibold" href="/messages">Messages</Link> for clarification only.</li>
                        </ul>
                      ) : order.status === "PICKUP_SCHEDULED" ? (
                        <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                          <li>This order is now in the <b>pickup scheduled</b> stage.</li>
                          <li>The current scheduled time stays binding until a replacement time is chosen in the order.</li>
                          <li>Honour the agreed time and use Messages only for clarification.</li>
                          <li>After the handover, leave feedback to help build trust.</li>
                        </ul>
                      ) : order.outcome === "COMPLETED" ? (
                        <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                          <li>This order is marked <b>COMPLETED</b>.</li>
                          <li>You can leave feedback anytime from this order.</li>
                        </ul>
                      ) : (
                        <ul className="mt-1 list-disc pl-5 text-sm bd-ink2">
                          <li>Check the order status above for the current step. Follow the scheduled pickup flow shown in the order.</li>
                          <li>Keep communication on Bidra in <Link className="bd-link font-semibold" href="/messages">Messages</Link> for clarification only.</li>
                        </ul>
                      )}
                    </div>
                  </Card>

                  This order is binding. Bidra records confirmations and scheduling. The scheduled pickup flow controls the order, and messages do not override it.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
'@

$adminEvents = @'
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import DateTimeText from "@/components/date-time-text";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminEventsPage({ searchParams }: { searchParams?: any }) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Admin events</h1>
        <p>Not allowed: {gate.reason}</p>
      </div>
    );
  }

  const session = await auth();
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  if (!isAdmin) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Admin events</h1>
        <p>Not authorised.</p>
      </div>
    );
  }

  const q = String(searchParams?.q || "").trim().slice(0, 80);
  const chipBase: React.CSSProperties = { textDecoration: "none", padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.15)", fontWeight: 800, background: "white", color: "inherit" };
  function chipStyle(active: boolean): React.CSSProperties {
    return active ? Object.assign({}, chipBase, { background: "#111", color: "white" }) : chipBase;
  }
  const type = String(searchParams?.type || "").trim().slice(0, 80);

  const where: Prisma.AdminEventWhereInput | undefined = (q || type)
    ? {
        AND: [
          type ? { type: type } : {},
          q
            ? {
                OR: [
                  { type: { contains: q, mode: "insensitive" as const } },
                  { userId: { contains: q, mode: "insensitive" as const } },
                  { orderId: { contains: q, mode: "insensitive" as const } },
                ],
              }
            : {},
        ],
      }
    : undefined;

  const rows = await prisma.adminEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Admin events</h1>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/admin" style={{ textDecoration: "underline" }}>Admin home</Link>
          <Link href="/admin/audit" style={{ textDecoration: "underline" }}>Audit log</Link>
        </div>
      </div>

      <p style={{ marginTop: 8, opacity: 0.75 }}>
        Shows internal audit events.
      </p>

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Link href="/admin/events" style={chipStyle(!type)}>All events</Link>
        <Link href="/admin/events?type=ORDER_PICKUP_SCHEDULED" style={chipStyle(type === "ORDER_PICKUP_SCHEDULED")}>Pickup scheduled</Link>
        <Link href="/admin/events?type=ORDER_RESCHEDULE_REQUESTED" style={chipStyle(type === "ORDER_RESCHEDULE_REQUESTED")}>Reschedule requested</Link>
        <Link href="/admin/events?type=ORDER_RESCHEDULE_OPTIONS_POSTED" style={chipStyle(type === "ORDER_RESCHEDULE_OPTIONS_POSTED")}>Replacement options posted</Link>
        <Link href="/admin/events?type=ORDER_RESCHEDULE_CONFIRMED" style={chipStyle(type === "ORDER_RESCHEDULE_CONFIRMED")}>Reschedule confirmed</Link>
        <Link href="/admin/events?type=ORDER_NO_SHOW_REPORTED" style={chipStyle(type === "ORDER_NO_SHOW_REPORTED")}>No-show reported</Link>
        <Link href="/admin/events?type=ORDER_NO_SHOW_REPORT_REVIEWED" style={chipStyle(type === "ORDER_NO_SHOW_REPORT_REVIEWED")}>No-show reviewed</Link>
      </div>

      <form method="get" style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input type="hidden" name="type" value={type} />
        <input
          name="q"
          defaultValue={q}
          placeholder='Filter (e.g. "ORDER_", userId, orderId)'
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)", minWidth: 280 }}
        />
        <button type="submit" style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)", background: "white", fontWeight: 800 }}>
          Filter
        </button>
        {q || type ? (
          <Link href="/admin/events" style={{ textDecoration: "underline", fontSize: 12 }}>Clear</Link>
        ) : null}
      </form>

      <div className="mt-4 rounded-xl border bd-bd bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/60 border-b bd-bd text-left">
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="When the event was recorded">Time</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Event type">Type</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="User id involved">User</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Order id if relevant">Order</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Readable event summary">Summary</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Event payload / details">Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const d = r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : null;
              const requestedByRole = d && typeof d["requestedByRole"] === "string" ? String(d["requestedByRole"]) : null;
              const reportedByRole = d && typeof d["reportedByRole"] === "string" ? String(d["reportedByRole"]) : null;
              const actorRole = requestedByRole || reportedByRole || null;
              const currentScheduledAt = d && d["currentScheduledAt"] ? String(d["currentScheduledAt"]) : null;
              const scheduledAt = d && d["scheduledAt"] ? String(d["scheduledAt"]) : null;
              const whenText = currentScheduledAt || scheduledAt || null;
              const reasonText = d && typeof d["reason"] === "string" ? String(d["reason"]) : null;
              const decisionText = d && typeof d["decision"] === "string" ? String(d["decision"]) : null;
              const noteText = d && typeof d["note"] === "string" ? String(d["note"]) : null;
              const isNoShowReviewed = r.type === "ORDER_NO_SHOW_REPORT_REVIEWED";

              return (
                <tr key={r.id} className="border-t bd-bd hover:bg-neutral-50">
                  <td className="px-4 py-3 bd-ink2 text-xs whitespace-nowrap"><DateTimeText value={r.createdAt} /></td>
                  <td className="px-4 py-3 bd-ink text-xs font-extrabold whitespace-nowrap">{r.type}</td>
                  <td style={{ padding: 10, fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>{r.userId || "-"}</td>
                  <td style={{ padding: 10, fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
                    {r.orderId ? <Link href={"/orders/" + r.orderId} style={{ textDecoration: "underline" }}>{r.orderId}</Link> : "-"}
                  </td>
                  <td className="px-4 py-3 bd-ink2 text-xs">
                    <div className="grid gap-1">
                      <div><span className="font-extrabold bd-ink">Role:</span> {actorRole || "-"}</div>
                      <div><span className="font-extrabold bd-ink">When:</span> {whenText || "-"}</div>
                      <div><span className="font-extrabold bd-ink">Reason:</span> {reasonText || "-"}</div>
                      {isNoShowReviewed ? <div><span className="font-extrabold bd-ink">Decision:</span> {decisionText || "-"}</div> : null}
                      {isNoShowReviewed ? <div><span className="font-extrabold bd-ink">Note:</span> {noteText || "-"}</div> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 bd-ink2 text-xs">
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.data ? JSON.stringify(r.data, null, 2) : "-"}</pre>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 12, opacity: 0.7 }}>No events yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'@

$adminResolve = @'
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const backTo = new URL("/admin/events", req.url);
  backTo.searchParams.set("type", "ORDER_RESCHEDULE_REQUESTED");
  backTo.searchParams.set("disabled", "1");
  return NextResponse.redirect(backTo);
}
'@

Write-Utf8NoBom -Path $rescheduleUiPath -Content $rescheduleUi
Write-Utf8NoBom -Path $rescheduleApiPath -Content $rescheduleApi
Write-Utf8NoBom -Path $pickupOptionsApiPath -Content $pickupOptionsApi
Write-Utf8NoBom -Path $pickupSelectApiPath -Content $pickupSelectApi
Write-Utf8NoBom -Path $orderPagePath -Content $orderPage
Write-Utf8NoBom -Path $adminEventsPath -Content $adminEvents
Write-Utf8NoBom -Path $adminResolvePath -Content $adminResolve
Write-Host '[OK] chunk 1 direct reschedule flow code patch applied'
