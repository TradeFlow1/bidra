import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingCard from "@/components/listing-card";
import { getSeoCategoryBySlug, getSeoCategoryLocationLinks, getSeoListings, getSiteUrl } from "@/lib/listing-seo";
import { BackButton } from "@/components/ui/back-button";
import { EmptyMarketplaceState, ReferencePage, appShell } from "@/components/marketplace-redesign";

type Props = {
  params: { category: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getSeoCategoryBySlug(params.category);
  if (!category) return {};

  const title = `${category.label} listings | Bidra`;
  const description = `Browse active ${category.label} listings on Bidra by location, price, condition, and seller trust signals. Buy Now or make offers with handover details kept in Messages.`;
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
    <ReferencePage>
      <div className={appShell + " py-5 sm:py-7"}>
        <BackButton href="/listings" label="Back to listings" />
        <section className="mt-4 rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="sm:hidden text-[11px] font-black uppercase tracking-[0.2em] text-[#0B4DFF]">Mobile marketplace view</div>
          <div className="hidden sm:block text-[11px] font-black uppercase tracking-[0.2em] text-[#0B4DFF]">Desktop marketplace view</div>
          <h1 className="mt-1 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">{category.label} listings</h1>
          <p className="mt-2 text-sm text-[#475569]">Browse active {category.label} listings on Bidra by location, price, condition, and seller trust signals. Buy Now or make offers, then keep pickup, postage, and handover details in Messages.</p>
          <div className="mt-4">
            <div className="flex flex-wrap gap-2"><Link href="/listings" className="bd-btn bd-btn-secondary text-center">Back to all listings</Link><Link href="/sell/new" className="bd-btn bd-btn-primary text-center">List in this category</Link></div>
          </div>
        </section>

        {locationLinks.length ? (
          <section className="mt-5 bd-card p-4 sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B]">Browse {category.label} by location</h2>
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
          <div className="browseList w-full grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
            {listings.length === 0 ? (
              <div className="col-span-full rounded-[28px] border border-dashed border-[#CBD5E1] bg-white px-6 py-12 text-center shadow-sm">
                <div className="text-lg font-bold text-[#0F172A]">No active {category.label} listings right now</div>
                <p className="mt-2 text-sm text-[#475569]">No real seller has published an active {category.label} listing yet. Browse all listings or create a buyer-ready listing in this category if you have an item to sell.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Link href="/sell/new" className="bd-btn bd-btn-primary text-center">Create a {category.label} listing</Link><Link href="/listings" className="bd-btn bd-btn-secondary text-center">Browse all listings</Link></div>
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
    </ReferencePage>
  );
}

