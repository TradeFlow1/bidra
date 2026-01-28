import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditListingClient from "./edit-listing-client";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) redirect("/dashboard");

  if (listing.sellerId !== session.user.id) redirect(`/listings/${listing.id}`);

  const images = Array.isArray((listing as unknown as { images?: unknown }).images) ? (((listing as unknown as { images?: unknown }).images) as string[]) : [];


  const highest = await prisma.bid.findFirst({
    where: { listingId: listing.id },
    orderBy: { amount: "desc" },
    select: { amount: true },
  });
  const highestOfferCents = highest?.amount ?? 0;
  return (
    <EditListingClient
      listing={{
        id: listing.id,
        title: listing.title,
        description: listing.description || "",
        category: listing.category || "General",
        condition: listing.condition || "Used",
        location: listing.location || "",
        priceDollars: Number(listing.price || 0) / 100,
        images,
        status: String((listing as unknown as { status?: unknown }).status || "DRAFT"),

        // Kevin timed-offers support (seller-controlled, late-stage only)
        type: String((listing as unknown as { type?: unknown }).type || "FIXED_PRICE"),
        endsAt: (listing as unknown as { endsAt?: unknown }).endsAt ? new Date((listing as unknown as { endsAt?: unknown }).endsAt as Date | string | number).toISOString() : null,
        buyNowPriceDollars: (listing as unknown as { buyNowPrice?: unknown }).buyNowPrice != null ? Number((listing as unknown as { buyNowPrice?: unknown }).buyNowPrice as number) / 100 : null,
        highestOfferCents,
      }}
    />
  );
}
