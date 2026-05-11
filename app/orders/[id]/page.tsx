import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";
import SafetyCallout from "../../../components/safety-callout";
import { BackButton } from "@/components/ui/back-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatMoney(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;
  return `$${(Number(value) / 100).toFixed(2)} AUD`;
}

function statusTone(status: string, outcome: string | null | undefined) {
  if (outcome === "COMPLETED") return "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (status === "PENDING") return "bg-blue-50 border-blue-200 text-blue-900";
  if (status === "ACCEPTED") return "bg-amber-50 border-amber-200 text-amber-900";
  return "bg-neutral-100 border-black/10 text-neutral-800";
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect(`/auth/login?next=/orders/${params.id}`);

  const gate = await requireAdult(session);
  if (!gate.ok) redirect("/account/restrictions");

  const orderId = params.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { listing: true }
  });

  if (!order) {
    return (
      <main className="bd-container py-10">
        <div className="mx-auto mb-4 w-full max-w-5xl"><BackButton href="/orders" label="Back to orders" /></div>
        <div className="container max-w-5xl space-y-5">
          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Order</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Sold item</h1>
          </div>
          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-base font-semibold bd-ink">Order not found</div>
            <p className="mt-2 text-sm bd-ink2">This order could not be found, may have moved, or may not be available to this account.</p>
            <div className="mt-5">
              <Link className="bd-btn bd-btn-secondary text-center" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (order.buyerId !== user.id && order.listing?.sellerId !== user.id) {
    return (
      <main className="bd-container py-10">
        <div className="mx-auto mb-4 w-full max-w-5xl"><BackButton href="/orders" label="Back to orders" /></div>
        <div className="container max-w-5xl space-y-5">
          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Order</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Sold item</h1>
          </div>
          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-base font-semibold bd-ink">Access restricted</div>
            <p className="mt-2 text-sm bd-ink2">You do not have access to this order.</p>
            <div className="mt-5">
              <Link className="bd-btn bd-btn-secondary text-center" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const listingHref = `/listings/${order.listingId}`;
  const messageHref = `/orders/${order.id}/message`;
  const feedbackHref = `/orders/${order.id}/feedback`;
  const isBuyer = order.buyerId === user.id;
  const isSeller = order.listing?.sellerId === user.id;
  const roleLabel = isBuyer ? "Buyer" : "Seller";
  const statusLabel = order.outcome === "COMPLETED" ? "COMPLETED" : "SOLD - HANDOVER PENDING";
  const primaryNextAction = order.outcome === "COMPLETED"
    ? "Leave feedback if you have not already, or keep the order record for reference."
    : "Message the other person to confirm payment, pickup or postage, tracking, packaging, dispatch timing, and handover details.";
  const primaryNextHref = order.outcome === "COMPLETED" ? feedbackHref : messageHref;
  const primaryNextLabel = order.outcome === "COMPLETED" ? "Review feedback options" : (isBuyer ? "Message seller" : "Message buyer");
  const canLeave =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !order.buyerFeedbackAt) || (isSeller && !order.sellerFeedbackAt));
  const alreadyLeft =
    order.outcome === "COMPLETED" &&
    ((isBuyer && !!order.buyerFeedbackAt) || (isSeller && !!order.sellerFeedbackAt));

  return (
    <main className="bd-container py-10">
        <div className="mx-auto mb-4 w-full max-w-5xl"><BackButton href="/orders" label="Back to orders" /></div>
        <div className="container max-w-5xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-800 shadow-sm">
                  {roleLabel}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(String(order.status), order.outcome)}`}>
                  {statusLabel}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Sold item</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                This order confirms the listing has sold. Use Messages to agree payment, pickup or postage, tracking, packaging, dispatch timing, and handover details before completing the transaction.
              </p>
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
                <div className="font-extrabold">Next action</div>
                <div className="mt-1">{primaryNextAction}</div>
              </div>
              <div className="mt-3 text-sm bd-ink2">
                Created <DateTimeText value={order.createdAt} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={primaryNextHref} className="bd-btn bd-btn-primary text-center">
                {primaryNextLabel}
              </Link>
              <Link href={messageHref} className="bd-btn bd-btn-secondary text-center">
                {isBuyer ? "Message seller" : "Message buyer"}
              </Link>
              <Link href="/orders" className="bd-btn bd-btn-secondary text-center">Orders</Link>
              <Link href={listingHref} className="bd-btn bd-btn-secondary text-center">View listing</Link>
              <Link href="/disputes" className="bd-btn bd-btn-secondary text-center">Need help?</Link>
              {canLeave ? (
                <Link href={feedbackHref} className="bd-btn bd-btn-secondary text-center">
                  Leave feedback
                </Link>
              ) : null}
              {alreadyLeft ? (
                <span className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold bd-ink shadow-sm">
                  Feedback submitted
                </span>
              ) : null}
            </div>
            <p className="text-sm bd-ink2">
              Use the highlighted next action above to keep the transaction moving.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Order ID</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{String(order.id).slice(-6)}</div>
            <div className="mt-1 text-sm text-neutral-600 font-mono break-all">{order.id}</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Amount</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{formatMoney(order.amount)}</div>
            <div className="mt-1 text-sm text-neutral-600">Final sold price.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Listing</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950 truncate">{order.listing?.title ?? "Listing"}</div>
            <div className="mt-1 text-sm text-neutral-600">Original listing.</div>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-sm font-extrabold bd-ink">Post-sale next steps</div>
            <ul className="mt-3 list-disc pl-5 text-sm bd-ink2 space-y-2">
              <li>Use Messages to confirm payment, pickup or postage, tracking, packaging, dispatch timing, and handover details before completing the transaction.</li>
              <li>If the order is pending, confirm payment, pickup or postage, carrier, tracking expectations, and handover details in Messages.</li>
              <li>If the order is completed, the next action is to leave feedback if it is available.</li>
              <li>Keep important agreements and handover details in Bidra Messages.</li>
              <li>Follow safety guidance before final handover or postage dispatch.</li>
            </ul>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <div className="font-extrabold">Handover safety checkpoint</div>
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
              <div className="font-extrabold">Shipping label status</div>
              <p className="mt-1">Bidra does not currently create shipping labels, calculate live postage rates, insure parcels, or manage Australia Post, Sendle, courier, or carrier claims. Agree postage details in Messages and keep tracking evidence.</p>
            </div>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>Confirm the exact item, amount, payment expectation, pickup suburb or postage method, and timing before handover.</li>
                <li>Use a public pickup location where practical and inspect the item before money changes hands.</li>
                <li>For postage, agree carrier, tracking, packaging, dispatch timing, item photos before dispatch, and who carries delivery risk before sending.</li>
                <li>If the other person changes terms suddenly or asks for unsafe payment methods, stop and contact Support.</li>
              </ul>
            </div>
          </Card>
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
              <div className="font-extrabold">Need help with this order?</div>
              <p className="mt-1">Use the Resolution Centre to collect the right order ID, listing link, Messages, screenshots, pickup notes, carrier name, tracking number, packaging photos, dispatch proof, and postage details before contacting support.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/disputes" className="bd-btn bd-btn-secondary text-center">Open resolution centre</Link>
                <Link href="/contact" className="bd-btn bd-btn-secondary text-center">Contact support</Link>
              </div>
            </div>

          <SafetyCallout title="Safety guidance">
            <ul className="list-disc pl-5 space-y-2">
              <li>Keep payment, pickup, postage method, carrier, tracking, packaging, dispatch, and important details in <Link className="bd-link font-semibold" href="/messages">Messages</Link>.</li>
              <li>Meet in a safe public place for pickup where practical.</li>
              <li>Use tracked delivery where appropriate, and save the tracking number and dispatch receipt.</li>
              <li>If anything feels suspicious, stop and report it.</li>
            </ul>
          </SafetyCallout>
        </div>
      </div>
    </main>
  );
}
