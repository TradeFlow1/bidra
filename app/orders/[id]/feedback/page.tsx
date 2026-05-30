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
      <main className="bd-container pb-24 pt-4 sm:py-10">
        <div className="container">
          <section className="space-y-4">
            <div className="bd-card">
              <h1 className="text-2xl font-extrabold tracking-tight">Leave feedback</h1>
              <p className="mt-2 text-black/70">This order could not be found, so feedback is not available from this page.</p>
              <div className="mt-5">
                <Link className="inline-flex h-9 items-center justify-center rounded-full border border-[#D8E1F0] bg-white px-4 text-center text-xs font-extrabold text-[#2437FF] shadow-sm transition hover:bg-[#F8FAFF]" href="/orders">
                  Back to orders
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
      <main className="bd-container pb-24 pt-4 sm:py-10">
        <div className="container">
          <section className="space-y-4">
            <div className="bd-card">
              <h1 className="text-2xl font-extrabold tracking-tight">Leave feedback</h1>
              <p className="mt-2 text-black/70">You do not have access to this order.</p>
              <div className="mt-5">
                <Link className="inline-flex h-9 items-center justify-center rounded-full border border-[#D8E1F0] bg-white px-4 text-center text-xs font-extrabold text-[#2437FF] shadow-sm transition hover:bg-[#F8FAFF]" href="/orders">
                  Back to orders
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
  const canSubmit = !alreadySubmitted;



    const completionRequiredCopy = "Feedback has already been submitted for this order.";
return (
    <main className="bd-container pb-24 pt-4 sm:py-10">
      <div className="container">
        <section className="space-y-4">
          <header className="rounded-[26px] border border-[#D7E2F1] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:rounded-[28px] sm:p-6">
            <div>
              <h1 className="text-2xl font-black leading-tight tracking-tight bd-ink sm:text-4xl">Rate this transaction</h1>
              <p className="mt-1 text-sm text-black/70">
                Order: <code className="font-mono">{order.id}</code>
              </p>
              <p className="mt-2 text-sm text-black/70">
                Feedback helps buyers and sellers trust each other after a completed order.
              </p>
            </div>

            <nav className="mt-4 flex flex-wrap gap-2">
              <Link className="inline-flex h-9 items-center justify-center rounded-full border border-[#D8E1F0] bg-white px-4 text-center text-xs font-extrabold text-[#2437FF] shadow-sm transition hover:bg-[#F8FAFF]" href="/orders">
                Orders
              </Link>
              <Link className="inline-flex h-9 items-center justify-center rounded-full border border-[#D8E1F0] bg-white px-4 text-center text-xs font-extrabold text-[#2437FF] shadow-sm transition hover:bg-[#F8FAFF]" href="/disputes">
                Need help?
              </Link>
              <Link className="inline-flex h-9 items-center justify-center rounded-full border border-[#D8E1F0] bg-white px-4 text-center text-xs font-extrabold text-[#2437FF] shadow-sm transition hover:bg-[#F8FAFF]" href={`/listings/${order.listing.id}`}>
                View listing
              </Link>
            </nav>
          </header>

          {alreadySubmitted ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
              <div className="font-extrabold">Feedback already submitted</div>
              <p className="mt-1">{completionRequiredCopy}</p>
            </div>
          ) : null}

          <div>
            <FeedbackClient
              orderId={order.id}
              listingTitle={order.listing.title}
              roleLabel={roleLabel}
              otherPartyLabel={otherPartyLabel}
              alreadySubmitted={alreadySubmitted}
              orderOutcome={order.outcome}
              canSubmit={canSubmit}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
