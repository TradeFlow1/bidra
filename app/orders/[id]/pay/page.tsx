export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import PayConfirmClient from "./pay-confirm-client";

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
  const user = session?.user as any;
  if (!user) redirect(`/auth/login?next=/orders/${params.id}/pay`);

  const gate = await requireAdult(session as any);
  if (!gate.ok) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-3xl">
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Pay</h1>
            <p className="mt-2 text-sm bd-ink2">This page is restricted.</p>
            <div className="mt-5">
              <Link className="bd-link font-semibold" href="/account">Back to account</Link>
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
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Pay</h1>
            <p className="mt-2 text-sm bd-ink2">Order not found.</p>
            <div className="mt-5">
              <Link className="bd-link font-semibold" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  // buyer OR seller can view, but only buyer can confirm payment
  const isBuyer = order.buyerId === user.id;
  const isSeller = (order.listing as any)?.sellerId === user.id;
  if (!isBuyer && !isSeller) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-3xl">
          <Card className="bd-card p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Pay</h1>
            <p className="mt-2 text-sm bd-ink2">You do not have access to this order.</p>
            <div className="mt-5">
              <Link className="bd-link font-semibold" href="/orders">Back to Orders</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const sellerId = (order.listing as any)?.sellerId as string | undefined;
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

  const orderHref = `/orders/${order.id}`;
  const listingHref = `/listings/${order.listingId}`;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-3xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Pay now</h1>
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

          <Card className="bd-card p-6">
            <div className="grid gap-3">
              <div className="text-lg font-extrabold">{order.listing?.title ?? "Listing"}</div>

              <div className="text-sm bd-ink2">
                Amount due: <b>{money(order.amount)}</b>
              </div>

              <div className="mt-2 bd-card p-4">
                <div className="text-sm font-extrabold bd-ink">Pay the seller (PayID / Osko)</div>
                <div className="mt-2 text-sm bd-ink2">
                  Send the exact amount via PayID/Osko using your banking app.
                </div>

                <div className="mt-3 grid gap-2 text-sm">
                  {sellerPayidEmail ? (
                    <div><span className="bd-ink2">PayID (email):</span> <b>{sellerPayidEmail}</b></div>
                  ) : (
                    <div className="text-xs bd-ink2">
                      Seller payout details are missing. Ask the seller to add PayID or bank details in Account Settings.
                    </div>
                  )}

                  {sellerPayidMobile ? (
                    <div><span className="bd-ink2">PayID (mobile):</span> <b>{sellerPayidMobile}</b></div>
                  ) : null}

                  <div><span className="bd-ink2">Reference:</span> <b>{order.id}</b></div>
                  <div><span className="bd-ink2">Amount:</span> <b>{money(order.amount)}</b></div>

                  {sellerBankBsb && sellerBankAccount ? (
                    <div className="mt-2 bd-card p-3">
                      <div className="text-sm font-extrabold bd-ink">Bank transfer (if you can’t use PayID)</div>
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

                <div className="mt-2 text-xs bd-ink2">
                  If you’re the seller and these details are wrong or blank, update them in{" "}
                  <Link className="bd-link font-semibold" href="/profile">Account Settings</Link>.
                </div>
              </div>

              {order.status === "PAID" ? (
                <div className="mt-2 text-sm bd-ink2">
                  This order is marked as <b>PAID</b>.
                </div>
              ) : (
                <div className="mt-2 grid gap-2">
                  {isBuyer ? (
                    <PayConfirmClient orderId={order.id} />
                  ) : (
                    <div className="text-sm bd-ink2">
                      Waiting for the buyer to confirm payment.
                    </div>
                  )}
                  <div className="text-xs bd-ink2">
                    Bidra is a marketplace platform — sellers control outcomes. This confirmation records that the buyer has sent payment.
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
