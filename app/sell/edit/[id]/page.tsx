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
        imageUrls: Array.isArray(listing.images) ? listing.images.join(", ") : "",
      }}
    />
  );
}
