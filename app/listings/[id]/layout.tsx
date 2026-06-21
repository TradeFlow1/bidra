import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TimedOfferWindowPanel from "@/components/timed-offer-window-panel";
import ListingPublicQuestions from "./listing-public-questions";

export default async function ListingDetailLayout({ children, params }: { children: ReactNode; params: { id: string } }) {
  const session = await auth();
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      sellerId: true,
      status: true,
      type: true,
      currentOfferAmount: true,
      offers: {
        where: { expiresAt: { gt: new Date() } },
        orderBy: { expiresAt: "asc" },
        select: { id: true, expiresAt: true },
        take: 20,
      },
    },
  });

  const userId = session?.user?.id || "";
  const offerCount = listing?.offers?.length || 0;
  const nextOfferExpiry = listing?.offers?.[0]?.expiresAt || null;

  return (
    <>
      {children}
      {listing ? (
        <div className="bg-white px-4 pb-12 text-[#080D32] sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-[880px]">
              {listing.status === "ACTIVE" ? (
                <TimedOfferWindowPanel
                  isOfferable={listing.type === "OFFERABLE"}
                  isOwner={userId === listing.sellerId}
                  currentOfferAmount={listing.currentOfferAmount}
                  offerCount={offerCount}
                  nextOfferExpiry={nextOfferExpiry}
                />
              ) : null}
              <ListingPublicQuestions listingId={listing.id} authed={!!userId} isOwner={userId === listing.sellerId} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
