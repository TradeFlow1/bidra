import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";
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
    <main className="bd-container py-6 sm:py-10">
      <div className="mx-auto mb-4 w-full max-w-4xl px-4">
        <BackButton href="/orders" label="Back to orders" />
      </div>

      <div className="container max-w-4xl space-y-3 sm:space-y-4">
        <section className="rounded-[28px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-800 shadow-sm">
                  {roleLabel}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(String(order.status), order.outcome)}`}>
                  {statusLabel}
                </span>
              </div>

              <h1 className="mt-3 truncate text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl">
                {order.listing?.title ?? "Order"}
              </h1>

              <p className="mt-1 text-sm text-neutral-600">
                Order created <DateTimeText value={order.createdAt} />.
              </p>

              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-800">Next step</div>
                <div className="mt-1 font-extrabold">{primaryNextAction}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:w-[270px]">
              <Link href={primaryNextHref} className="rounded-2xl bg-[#061126] px-3 py-3 text-center text-xs font-extrabold text-white shadow-sm transition hover:opacity-90">
                {primaryNextLabel}
              </Link>
              <Link href={listingHref} className="rounded-2xl border border-[#D8E1F0] bg-white px-3 py-3 text-center text-xs font-extrabold text-[#0B4DFF] shadow-sm transition hover:bg-[#F8FAFC]">
                Item
              </Link>
              <Link href="/disputes" className="rounded-2xl border border-[#D8E1F0] bg-white px-3 py-3 text-center text-xs font-extrabold text-[#0B4DFF] shadow-sm transition hover:bg-[#F8FAFC]">
                Help
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#D8E1F0] pt-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Amount</div>
              <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{formatMoney(order.amount)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Order ID</div>
              <div className="mt-1 truncate text-sm font-extrabold text-neutral-950">{String(order.id).slice(-6)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</div>
              <div className="mt-1 text-sm font-extrabold text-neutral-950">{statusLabel}</div>
            </div>
          </div>

          {canLeave ? (
            <div className="mt-4 border-t border-[#D8E1F0] pt-4">
              <Link href={feedbackHref} className="bd-btn bd-btn-secondary text-center">
                Leave feedback
              </Link>
            </div>
          ) : null}

          {alreadyLeft ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950">
              Feedback submitted.
            </div>
          ) : null}
        </section>

        <details className="rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
          <summary className="cursor-pointer select-none font-extrabold text-neutral-950">
            Handover safety checkpoint
          </summary>

          <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950">
            <div className="font-extrabold">Shipping label status</div>
            <p className="mt-1">
              Bidra does not currently create shipping labels, calculate live postage rates, insure parcels, or manage carrier claims.
            </p>
          </div>

          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Confirm the exact item, amount, payment expectation, pickup suburb or postage method, and timing before handover.</li>
            <li>Use a public pickup location where practical and inspect the item before money changes hands.</li>
            <li>For postage, agree carrier, tracking, packaging, dispatch timing, item photos before dispatch, and who carries delivery risk before sending.</li>
            <li>If the other person changes terms suddenly or asks for unsafe payment methods, stop and contact Support.</li>
          </ul>
        </details>

        <details className="rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
          <summary className="cursor-pointer select-none font-extrabold text-neutral-950">
            Need help with this order?
          </summary>

          <p className="mt-2">
            Keep payment, pickup, postage method, carrier, tracking, packaging, dispatch, and important details in Messages.
          </p>
          <p className="mt-2">
            No dead-end Pay now or completion step is required.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/disputes" className="bd-btn bd-btn-secondary text-center">
              Resolution centre
            </Link>
            <Link href="/contact" className="bd-btn bd-btn-secondary text-center">
              Contact support
            </Link>
            <Link href="/orders" className="bd-btn bd-btn-secondary text-center">
              Orders
            </Link>
          </div>
        </details>
      </div>
    </main>
  );
}
}
