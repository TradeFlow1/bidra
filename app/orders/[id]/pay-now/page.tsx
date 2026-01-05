import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import MessageSellerButton from "@/app/listings/[id]/message-seller-button";

export const dynamic = "force-dynamic";

export default async function PayNowInfoPage({ params }: { params: { id: string } }) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return (
      <main className="bd-container py-6 pb-14">
        <div className="bd-card p-6">
          <div className="text-lg font-bold">Access restricted</div>
          <div className="mt-2 text-sm text-neutral-600">Please sign in to continue.</div>
        </div>
      </main>
    );
  }

  const userId = (gate as any)?.session?.user?.id as string | undefined;
  if (!userId) {
    return (
      <main className="bd-container py-6 pb-14">
        <div className="bd-card p-6">Not signed in.</div>
      </main>
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      buyerId: true,
      listingId: true,
      listing: { select: { title: true } },
    },
  });

  if (!order) {
    return (
      <main className="bd-container py-6 pb-14">
        <div className="bd-card p-6">Order not found.</div>
      </main>
    );
  }

  if (order.buyerId !== userId) {
    return (
      <main className="bd-container py-6 pb-14">
        <div className="bd-card p-6">You don’t have access to this order.</div>
      </main>
    );
  }

  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-6 space-y-4">
        <Link href={`/orders/${order.id}`} className="bd-link text-sm">
          ← Back to order
        </Link>

        <div className="text-2xl font-extrabold">Success</div>

        <div className="text-sm text-neutral-700">
          You have successfully bought{" "}
          <span className="font-semibold">{order.listing?.title ?? "this item"}</span>.
          <div className="mt-2">
            Contact the seller to organise payment and pickup/postage.
          </div>
          <div className="mt-2 text-neutral-500">
            Bidra Pay is coming soon — this page will be replaced later.
          </div>
        </div>

        <div className="pt-2">
          <MessageSellerButton listingId={order.listingId} />
        </div>
      </div>
    </main>
  );
}
