import Link from "next/link";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ListingCard from "@/components/listing-card";
import { getSeoCategoryBySlug, getSeoListings, getSeoLocationBySlug, getSiteUrl } from "@/lib/listing-seo";
import { BackButton } from "@/components/ui/back-button";
import { EmptyMarketplaceState, ReferencePage, appShell } from "@/components/marketplace-redesign";

const legacyCategoryRedirects: Record<string, string> = {
  "home-garden": "/listings?category=Home%20%26%20Living",
  "home-and-garden": "/listings?category=Home%20%26%20Living",
  "home-living": "/listings?category=Home%20%26%20Living",
  "sport-outdoors": "/listings?category=Sports%20%26%20Outdoors",
  "sports-outdoors": "/listings?category=Sports%20%26%20Outdoors",
  "baby-kids": "/listings?category=Kids%20%26%20Baby",
  "kids-baby": "/listings?category=Kids%20%26%20Baby",
  "collectables": "/listings?category=Books%20%26%20Media",
  "collectibles": "/listings?category=Books%20%26%20Media",
  "appliances": "/listings?category=Other",
};
type Props = {
  params: { category: string; location: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (legacyCategoryRedirects[params.category]) return {};
  const category = getSeoCategoryBySlug(params.category);
  const location = getSeoLocationBySlug(params.location);
  if (!category || !location) return {};

  const title = `${category.label} listings in ${location.label} | Bidra`;
  const description = `Discover ${category.label} marketplace listings near ${location.label} on Bidra. Compare local Buy now and offer listings with seller trust signals and safer handover guidance.`;
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
  const legacyRedirect = legacyCategoryRedirects[params.category];
  if (legacyRedirect) redirect(legacyRedirect);

  const category = getSeoCategoryBySlug(params.category);
  const location = getSeoLocationBySlug(params.location);

  if (!category || !location) notFound();

  const listings = await getSeoListings(category.label, location.label);

  return (
    <ReferencePage>
      <div className={appShell + " py-5 sm:py-7"}>
        <BackButton href="/listings" label="Back to listings" />
        <section className="mt-4 rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <h1 className="text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">{category.label} listings in {location.label}</h1>
          <p className="mt-2 text-sm text-[#475569]">Active {category.label} listings near {location.label}, with Buy now and offer options, seller trust signals, and pickup, postage, or handover details kept in Messages.</p>
          <div className="mt-4 flex flex-wrap gap-2"><Link href={`/listings/c/${category.slug}`} className="bd-btn bd-btn-secondary text-center">View all {category.label}</Link><Link href="/listings" className="bd-btn bd-btn-secondary text-center">Back to all listings</Link><Link href="/sell/new" className="bd-btn bd-btn-primary text-center">List in {location.label}</Link></div>
        </section>

        <section className="mt-5">
          <div className="browseList w-full grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
            {listings.length === 0 ? (
              <div className="col-span-full rounded-[28px] border border-dashed border-[#CBD5E1] bg-white px-6 py-12 text-center shadow-sm">
                <div className="mx-auto max-w-2xl">
                  <div className="text-lg font-bold text-[#0F172A]">No active {category.label} listings in {location.label} yet</div>
                  <p className="mt-2 text-sm text-[#475569]">No real seller has published this category and location combination yet. Create a buyer-ready listing if you have an item to sell nearby, or browse the wider category.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Link href="/sell/new" className="bd-btn bd-btn-primary text-center">Create a listing</Link>
                    <Link href={`/listings/c/${category.slug}`} className="bd-btn bd-btn-secondary text-center">View all {category.label}</Link>
                    <Link href="/listings" className="bd-btn bd-btn-secondary text-center">Browse all listings</Link>
                  </div>
                </div>
              </div>
            ) : (
              listings.map(function (listing) {
              const listingType = (listing as { type?: string }).type || "";
              const listingPrice = (listing as { price?: number }).price ?? 0;
              const listingBuyNowPrice = (listing as { buyNowPrice?: number | null }).buyNowPrice ?? null;
              const currentOffer = (listing as unknown as { currentOfferAmount?: number | null }).currentOfferAmount ?? null;
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
    </ReferencePage>
  );
}

