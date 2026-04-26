import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingCard from "@/components/listing-card";
import { getSeoCategoryBySlug, getSeoListings, getSeoLocationBySlug, getSiteUrl } from "@/lib/listing-seo";

type Props = {
  params: { category: string; location: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getSeoCategoryBySlug(params.category);
  const location = getSeoLocationBySlug(params.location);
  if (!category || !location) return {};

  const title = `${category.label} listings in ${location.label} | Bidra`;
  const description = `Browse active ${category.label} listings near ${location.label} on Bidra.`;
  const canonicalPath = `/listings/c/${category.slug}/${location.slug}`;
  const url = `${getSiteUrl()}${canonicalPath}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
  };
}

export default async function CategoryLocationSeoPage({ params }: Props) {
  const category = getSeoCategoryBySlug(params.category);
  const location = getSeoLocationBySlug(params.location);

  if (!category || !location) notFound();

  const listings = await getSeoListings(category.label, location.label);
  if (listings.length === 0) notFound();

  return (
    <main className="bg-[#F7F9FC]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
        <section className="rounded-[32px] border border-[#D8E1F0] bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">{category.label} listings in {location.label}</h1>
          <p className="mt-2 text-sm text-[#475569]">Active {category.label} listings near {location.label}.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/listings/c/${category.slug}`} className="text-sm font-semibold text-[#1D4ED8] underline underline-offset-2">View all {category.label}</Link>
            <Link href="/listings" className="text-sm font-semibold text-[#1D4ED8] underline underline-offset-2">Back to all listings</Link>
          </div>
        </section>

        <section className="mt-5">
          <div className="browseList w-full grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
            {listings.map(function (listing) {
              const listingType = (listing as { type?: string }).type || "";
              const listingPrice = (listing as { price?: number }).price ?? 0;
              const listingBuyNowPrice = (listing as { buyNowPrice?: number | null }).buyNowPrice ?? null;
              const currentOffer = (listing as unknown as { offers?: Array<{ amount?: number | null }> }).offers?.length
                ? (listing as unknown as { offers?: Array<{ amount?: number | null }> }).offers?.[0]?.amount ?? null
                : null;
              const displayPrice = listingType === "OFFERABLE"
                ? ((currentOffer ?? listingPrice) as number)
                : ((listingBuyNowPrice ?? listingPrice) as number);

              return (
                <ListingCard
                  key={listing.id}
                  listing={{
                    id: listing.id,
                    title: listing.title,
                    description: listing.description,
                    price: displayPrice,
                    buyNowPrice: listing.buyNowPrice,
                    type: (listing as { type?: "BUY_NOW" | "OFFERABLE" }).type ?? "BUY_NOW",
                    category: listing.category,
                    condition: listing.condition,
                    location: listing.location,
                    images: listing.images ?? null,
                    status: listing.status ?? "ACTIVE",
                    endsAt: null,
                    offerCount: (listing as unknown as { _count?: { offers?: number } })._count?.offers ?? 0,
                    currentOffer,
                    seller: {
                      name: (listing as unknown as { seller?: { name?: string | null; username?: string | null } }).seller?.name || (listing as unknown as { seller?: { name?: string | null; username?: string | null } }).seller?.username || null,
                      memberSince: (listing as unknown as { seller?: { createdAt?: Date | null } }).seller?.createdAt ?? null,
                      location: (listing as unknown as { seller?: { location?: string | null } }).seller?.location ?? null,
                      emailVerified: (listing as unknown as { seller?: { emailVerified?: boolean | null } }).seller?.emailVerified ?? false,
                      phone: (listing as unknown as { seller?: { phone?: string | null } }).seller?.phone ?? null,
                    },
                  }}
                  initiallyWatched={false}
                  viewerAuthed={false}
                  showWatchButton={false}
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
