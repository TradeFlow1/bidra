export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FeedbackClient from "./feedback-client";

export default async function FeedbackPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/auth/login?next=/orders/${params.id}/feedback`);
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
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <h1>Leave feedback</h1>
        <p>Order not found.</p>
        <Link href="/account">Back to My account</Link>
      </main>
    );
  }

  const isBuyer = order.buyerId === userId;
  const isSeller = order.listing.sellerId === userId;

  if (!isBuyer && !isSeller) {
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <h1>Leave feedback</h1>
        <p>You do not have access to this order.</p>
        <Link href="/account">Back to My account</Link>
      </main>
    );
  }

  const roleLabel = isBuyer ? "buyer" : "seller";
  const otherPartyLabel = isBuyer ? "seller" : "buyer";
  const alreadySubmitted = isBuyer
    ? !!order.buyerFeedbackAt
    : !!order.sellerFeedbackAt;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <h1>Leave feedback</h1>
          <p style={{ opacity: 0.7 }}>
            Order: <code>{order.id}</code>
          </p>
        </div>

        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/account">My account</Link>
          <Link href={`/listings/${order.listing.id}`}>View listing</Link>
        </nav>
      </header>

      <div style={{ marginTop: 20 }}>
        <FeedbackClient
          orderId={order.id}
          listingTitle={order.listing.title}
          roleLabel={roleLabel}
          otherPartyLabel={otherPartyLabel}
          alreadySubmitted={alreadySubmitted}
          orderOutcome={order.outcome}
        />
      </div>
    </main>
  );
}