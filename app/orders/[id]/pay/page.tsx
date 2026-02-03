export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import PayConfirmClient from "./pay-confirm-client";
import SafetyCallout from "../../../../components/safety-callout";
import OrderStatusTimeline from "../../../../components/order-status-timeline";

function money(cents: number) {
  return (cents / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

function formatPayidMobile(digits: string) {
  const d = (digits || "").replace(/[^\d]/g, "");
  // AU mobile: 04xxxxxxxx (10 digits). Display as 04xx xxx xxx when possible.
  if (d.length === 10 && d.startsWith("04")) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  return digits || "";
}

export default async function OrderPayPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect(`/auth/login?next=/orders/${params.id}/pay`);

  const gate = await requireAdult(session);
  if (!gate.ok) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-3xl">
          <SafetyCallout title="Payment safety">
            <ul className="list-disc pl-5">
              <li>Only pay using the details shown here or confirmed in Bidra messages.</li>
              <li>Verify the seller and listing before sending money (especially for high-value items).</li>
              <li>Meet in public where possible and inspect items before paying.</li>
            </ul>
          </SafetyCallout>
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Pay</h1>
            <p className="mt-2 text-sm bd-ink2">This page is restricted.</p>
            <div className="mt-5">
               <Link href="/account" className="bd-btn bd-btn-ghost">Back to account</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { listing: true },
  });

  if (!order) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-3xl">
          <SafetyCallout title="Payment safety">
            <ul className="list-disc pl-5">
              <li>Only pay using the details shown here or confirmed in Bidra messages.</li>
              <li>Verify the seller and listing before sending money (especially for high-value items).</li>
              <li>Meet in public where possible and inspect items before paying.</li>
            </ul>
          </SafetyCallout>
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Pay</h1>
            <p className="mt-2 text-sm bd-ink2">Order not found.</p>
            <div className="mt-5">
               <Link href="/orders" className="bd-btn bd-btn-ghost">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  // buyer OR seller can view, but only buyer can confirm payment
  const isBuyer = order.buyerId === user.id;
  const isSeller = (order.listing as unknown as { sellerId?: string } | null | undefined)?.sellerId === user.id;
  if (!isBuyer && !isSeller) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-3xl">
          <SafetyCallout title="Payment safety">
            <ul className="list-disc pl-5">
              <li>Only pay using the details shown here or confirmed in Bidra messages.</li>
              <li>Verify the seller and listing before sending money (especially for high-value items).</li>
              <li>Meet in public where possible and inspect items before paying.</li>
            </ul>
          </SafetyCallout>
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Pay</h1>
            <p className="mt-2 text-sm bd-ink2">You do not have access to this order.</p>
            <div className="mt-5">
               <Link href="/orders" className="bd-btn bd-btn-ghost">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const sellerId = (order.listing as unknown as { sellerId?: string } | null | undefined)?.sellerId;
  const seller = sellerId
    ? await prisma.user.findUnique({
        where: { id: sellerId },
        select: {
          id: true,
          email: true,
          payidEmail: true,
          payidMobile: true,
          bankName: true,
          bankBsb: true,
          bankAccount: true,
        },
      })
    : null;

  const sellerPayidEmail = (seller?.payidEmail || seller?.email || "").trim();
  const sellerPayidMobile = formatPayidMobile((seller?.payidMobile || "").trim());
  const sellerBankName = (seller?.bankName || "").trim();
  const sellerBankBsb = (seller?.bankBsb || "").trim();
  const sellerBankAccount = (seller?.bankAccount || "").trim();

  const hasPayDetails = Boolean(
    sellerPayidEmail || sellerPayidMobile || (sellerBankBsb && sellerBankAccount)
  );

  const orderHref = `/orders/${order.id}`;
  const listingHref = `/listings/${order.listingId}`;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-3xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Pay now</h1>
               <div className="mt-2 text-sm bd-ink2">
                 {isBuyer ? (
                   <>
                     <b>This is a binding purchase.</b> You created this order by using Buy Now (or the seller accepted your offer). You're expected to complete payment using the details below.
                   </>
                 ) : (
                   <>
                     <b>This is a binding sale.</b> The buyer is expected to complete payment using the details below. After the buyer marks “I’ve paid”, you’ll confirm whether you received it.
                   </>
                 )}
               </div>
              <div className="text-sm bd-ink2 mt-1">
                <Badge>{order.status}</Badge>{" "}
                <span className="ml-2">Order <code className="font-mono">{order.id}</code></span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={orderHref} className="bd-btn bd-btn-primary text-center">Back to order</Link>
              <Link href={listingHref} className="bd-btn bd-btn-primary text-center">View listing</Link>
            </div>
          </div>

          <SafetyCallout title="Payment safety">
            <ul className="list-disc pl-5">
              <li>Only pay using the details shown here or confirmed in Bidra messages.</li>
              <li>Verify the seller and listing before sending money (especially for high-value items).</li>
              <li>Meet in public where possible and inspect items before paying.</li>
            </ul>
          </SafetyCallout>
          <Card className="bd-card p-6">
            <div className="grid gap-3">
              <div className="text-lg font-extrabold">{order.listing?.title ?? "Listing"}</div>

              <div className="text-sm bd-ink2">
                Amount due: <b>{money(order.amount)}</b>
              </div>

              <OrderStatusTimeline status={order.status} outcome={order.outcome} className="mt-3" />


              <div className="mt-2 bd-card p-4">
                <div className="text-sm font-extrabold bd-ink">Pay the seller (PayID / Osko)</div>
                <div className="mt-2 text-sm bd-ink2">
                  Send the exact amount via PayID/Osko using your banking app.
                </div>

                <div className="mt-3 grid gap-2 text-sm">
                  {(sellerPayidEmail || sellerPayidMobile) ? (
                    <>
                      {sellerPayidEmail ? (
                        <div><span className="bd-ink2">PayID (email):</span> <b>{sellerPayidEmail}</b></div>
                      ) : null}

                      {sellerPayidMobile ? (
                        <div><span className="bd-ink2">PayID (mobile):</span> <b>{sellerPayidMobile}</b></div>
                      ) : null}
                    </>
                  ) : (
                    <div className="text-xs bd-ink2">
                      Seller payout details are missing. Please message the seller to add PayID/bank details.
                    </div>
                  )}

                  

                  <div><span className="bd-ink2">Reference:</span> <b>{order.id}</b></div>
                  <div><span className="bd-ink2">Amount:</span> <b>{money(order.amount)}</b></div>

                  {sellerBankBsb && sellerBankAccount ? (
                    <div className="mt-2 bd-card p-3">
                      <div className="text-sm font-extrabold bd-ink">Bank transfer (if you can't use PayID)</div>
                      <div className="mt-2 grid gap-1 text-sm">
                        {sellerBankName ? <div><span className="bd-ink2">Name:</span> <b>{sellerBankName}</b></div> : null}
                        <div><span className="bd-ink2">BSB:</span> <b>{sellerBankBsb}</b></div>
                        <div><span className="bd-ink2">Account:</span> <b>{sellerBankAccount}</b></div>
                        <div><span className="bd-ink2">Reference:</span> <b>{order.id}</b></div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 text-xs bd-ink2">
                  Tip: include the reference exactly so the seller can match your payment quickly.
                  </div>

                  <div className="mt-3 bd-card p-4">
                    <div className="text-sm font-extrabold bd-ink">Payment steps</div>
                    <ol className="mt-2 list-decimal pl-5 text-sm bd-ink2 space-y-1">
                      <li>Open your banking app and send <b>{money(order.amount)}</b> to the seller using PayID (preferred) or bank transfer.</li>
                      <li>Set the payment <b>reference</b> to <b>{order.id}</b> exactly.</li>
                      <li>After you’ve paid, press <b>I’ve paid</b> below to notify the seller.</li>
                    </ol>
                    <div className="mt-2 text-xs bd-ink2">
                      Note: Bidra doesn’t verify the transfer instantly. This confirmation records your claim and helps the seller match the payment.
                    </div>
                  </div>

                  <div className="mt-3 text-xs bd-ink2">

                {!hasPayDetails ? (
                  <div className="mt-3 bd-card p-4">
                    <div className="text-sm font-extrabold bd-ink">Missing payout details</div>
                    <div className="mt-1 text-sm bd-ink2">
                      You can't complete payment until the seller adds PayID/bank details. Use the buttons below to view the listing and message them.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={listingHref} className="bd-btn bd-btn-primary text-center">View listing</Link>
                      <Link href={orderHref} className="bd-btn bd-btn-primary text-center">Back to order</Link>
                      <Link href="/profile" className="bd-btn bd-btn-primary text-center">Account Settings</Link>
                    </div>
                  </div>
                ) : null}

                </div>

                <div className="mt-2 text-xs bd-ink2">
                  If you're the seller and these details are wrong or blank, update them in{" "}
                  <Link href="/profile" className="bd-btn bd-btn-ghost bd-btn-sm align-middle">Account Settings</Link>.
                </div>
              </div>

              {order.status === "PAID" ? (
                <div className="mt-2 text-sm bd-ink2">
                  This order is marked as <b>PAID</b>.
                </div>
              ) : (
                <div className="mt-2 grid gap-2">
                  {isBuyer ? (
                    hasPayDetails ? (
                      <PayConfirmClient orderId={order.id} />
                    ) : (
                      <div className="text-sm bd-ink2">
                        Waiting for the seller to add payout details. View the listing and message them to add PayID/bank details.
                      </div>
                    )
                  ) : (
                    <div className="text-sm bd-ink2">
                      This is a binding order. Waiting for the buyer to complete payment.
                    </div>
                  )}
                  <div className="text-xs bd-ink2">
                    Bidra is a marketplace platform — sellers control outcomes. Bidra records payment confirmations but does not process payments or guarantee outcomes.
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
