import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingPublicQuestions from "./listing-public-questions";

export default async function ListingDetailLayout({ children, params }: { children: ReactNode; params: { id: string } }) {
  const session = await auth();
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: { id: true, sellerId: true },
  });

  const userId = session?.user?.id || "";

  return (
    <>
      {children}
      {listing ? (
        <div className="bg-white px-4 pb-12 text-[#080D32] sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-[880px]">
              <ListingPublicQuestions listingId={listing.id} authed={!!userId} isOwner={userId === listing.sellerId} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
