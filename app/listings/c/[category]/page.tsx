import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingCard from "@/components/listing-card";
import { getSeoCategoryBySlug, getSeoCategoryLocationLinks, getSeoListings, getSiteUrl } from "@/lib/listing-seo";

type Props = {
  params: { category: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getSeoCategoryBySlug(params.category);
  if (!category) return {};

  const title = `${category.label} listings | Bidra`;
  const description = `Browse active ${category.label} listings on Bidra.`;
  const canonicalPath = `/listings/c/${category.slug}`;
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

export default async function CategorySeoPage({ params }: Props) {
  const category = getSeoCategoryBySlug(params.category);
  if (!category) notFound();

  const [listings, locationLinks] = await Promise.all([
    getSeoListings(category.label),
    getSeoCategoryLocationLinks(category.label),
  ]);

  return (
    <main className="bg-[#F7F9FC]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
        <section className="rounded-[32px] border border-[#D8E1F0] bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">{category.label} listings</h1>
          <p className="mt-2 text-sm text-[#475569]">Browse active {category.label} listings on Bidra.</p>
          <div className="mt-4">
            <Link href="/listings" className="text-sm font-semibold text-[#1D4ED8] underline underline-offset-2">Back to all listings</Link>
          </div>
        </section>

        {locationLinks.length ? (
          <section className="mt-5 rounded-[28px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B]">Browse by location</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {locationLinks.map(function (location) {
                return (
                  <Link
                    key={location.slug}
                    href={`/listings/c/${category.slug}/${location.slug}`}
                    className="inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-3 py-1.5 text-sm font-semibold text-[#0F172A]"
                  >
                    {location.label}
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="mt-5">
          <div className="browseList w-full grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
            {listings.length === 0 ? (
              <div className="col-span-full rounded-[28px] border border-dashed border-[#CBD5E1] bg-white px-6 py-12 text-center shadow-sm">
                <div className="text-lg font-bold text-[#0F172A]">No active {category.label} listings right now</div>
                <p className="mt-2 text-sm text-[#475569]">Check back soon for new listings in this category.</p>
              </div>
            ) : (
              listings.map(function (listing) {
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
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
