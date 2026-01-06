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

  const images = Array.isArray((listing as any).images) ? ((listing as any).images as string[]) : [];

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
        status: String((listing as any).status || "DRAFT"),

        // Kevin timed-offers support (seller-controlled, late-stage only)
        type: String((listing as any).type || "FIXED_PRICE"),
        endsAt: (listing as any).endsAt ? new Date((listing as any).endsAt).toISOString() : null,
        buyNowPriceDollars: (listing as any).buyNowPrice != null ? Number((listing as any).buyNowPrice) / 100 : null,
      }}
    />
  );
}
