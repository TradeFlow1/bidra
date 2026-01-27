export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import FeedbackClient from "./feedback-client";

export default async function FeedbackPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/login?next=/orders/${params.id}/feedback`);
  }

  const gate = await requireAdult(session);
  if (!gate.ok) {
    redirect("/account/restrictions");
  }

  const orderId = params.id;
  const userId = session.user.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      outcome: true,
      buyerId: true,
      buyerFeedbackAt: true,
      sellerFeedbackAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          sellerId: true,
        },
      },
    },
  });

  if (!order) {
    return (
      <main className="bd-container">
        <div className="container">
          <section className="py-10">
            <div className="bd-card">
              <h1 className="text-2xl font-extrabold tracking-tight">Leave feedback</h1>
              <p className="mt-2 text-black/70">Order not found.</p>
              <div className="mt-5">
                <Link className="underline font-semibold" href="/account">
                  Back to My account
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const isBuyer = order.buyerId === userId;
  const isSeller = order.listing.sellerId === userId;

  if (!isBuyer && !isSeller) {
    return (
      <main className="bd-container">
        <div className="container">
          <section className="py-10">
            <div className="bd-card">
              <h1 className="text-2xl font-extrabold tracking-tight">Leave feedback</h1>
              <p className="mt-2 text-black/70">You do not have access to this order.</p>
              <div className="mt-5">
                <Link className="underline font-semibold" href="/account">
                  Back to My account
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const roleLabel = isBuyer ? "buyer" : "seller";
  const otherPartyLabel = isBuyer ? "seller" : "buyer";
  const alreadySubmitted = isBuyer ? !!order.buyerFeedbackAt : !!order.sellerFeedbackAt;

  return (
    <main className="bd-container">
      <div className="container">
        <section className="py-10">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Leave feedback</h1>
              <p className="mt-1 text-sm text-black/70">
                Order: <code className="font-mono">{order.id}</code>
              </p>
            </div>

            <nav className="flex flex-wrap gap-3">
              <Link className="underline font-semibold" href="/account">
                My account
              </Link>
              <Link className="underline font-semibold" href={`/listings/${order.listing.id}`}>
                View listing
              </Link>
            </nav>
          </header>

          <div className="mt-6">
            <FeedbackClient
              orderId={order.id}
              listingTitle={order.listing.title}
              roleLabel={roleLabel}
              otherPartyLabel={otherPartyLabel}
              alreadySubmitted={alreadySubmitted}
              orderOutcome={order.outcome}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
