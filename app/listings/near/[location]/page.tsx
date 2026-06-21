import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingCard from "@/components/listing-card";
import { BackButton } from "@/components/ui/back-button";
import { EmptyMarketplaceState, ReferencePage, appShell } from "@/components/marketplace-redesign";
import { getSeoLocationBySlug, getSeoLocationListings, getSiteUrl } from "@/lib/listing-seo";

type Props = {
  params: { location: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const location = getSeoLocationBySlug(params.location);
  if (!location) return {};

  const placeLabel = location.state ? `${location.label}, ${location.state}` : location.label;
  const title = `Marketplace listings near ${placeLabel} | Bidra`;
  const description = `Browse active marketplace listings near ${placeLabel} on Bidra. Find Buy Now and offer listings with seller trust signals and clear pickup, postage or handover guidance.`;
  const canonicalPath = `/listings/near/${location.slug}`;
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

export default async function SuburbLandingPage({ params }: Props) {
  const location = getSeoLocationBySlug(params.location);
  if (!location) notFound();

  const placeLabel = location.state ? `${location.label}, ${location.state}` : location.label;
  const listings = await getSeoLocationListings(location.label);

  return (
    <ReferencePage>
      <div className={appShell + " py-5 sm:py-7"}>
        <BackButton href="/listings" label="Back to listings" />

        <section className="mt-4 rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0B4DFF]">Local marketplace</div>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">Marketplace listings near {placeLabel}</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#475569] sm:text-base">
            Browse local listings near {placeLabel}. Buyers and sellers use Bidra to find listings, ask questions, make offers and keep handover details in Messages.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/listings" className="bd-btn bd-btn-secondary text-center">Browse all listings</Link>
            <Link href={`/listings?location=${encodeURIComponent(location.label)}`} className="bd-btn bd-btn-secondary text-center">Search {location.label}</Link>
            <Link href="/sell/new" className="bd-btn bd-btn-primary text-center">List in {location.label}</Link>
          </div>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black tracking-[-0.04em] text-[#07152E]">Active listings</h2>
              <span className="rounded-full border border-[#D8E6F8] bg-white px-3 py-1 text-xs font-black text-[#4F46E5]">{listings.length} found</span>
            </div>
            <div className="browseList w-full grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {listings.length === 0 ? (
                <div className="col-span-full">
                  <EmptyMarketplaceState
                    title={`No active listings near ${location.label} yet`}
                    body="No real seller has published a matching local listing yet. Create a buyer-ready listing with clear photos, price, condition and handover details."
                    href="/sell/new"
                    cta="Create a listing"
                  />
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
          </div>

          <aside className="rounded-[28px] border border-[#D8E6F8] bg-white p-5 shadow-sm">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#64748B]">Local safety</div>
            <h2 className="mt-2 text-xl font-black tracking-tight text-[#07152E]">Agree handover details clearly</h2>
            <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-[#526173]">
              <li>Keep conversations in Bidra Messages.</li>
              <li>Confirm pickup, postage or delivery directly with the other person.</li>
              <li>Inspect items before paying where practical.</li>
              <li>Report unsafe listings or unusual requests.</li>
            </ul>
          </aside>
        </section>
      </div>
    </ReferencePage>
  );
}
