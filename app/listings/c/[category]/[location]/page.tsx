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
    params: {
        category: string;
        location: string;
    };
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    if (legacyCategoryRedirects[params.category])
        return {};
    const category = getSeoCategoryBySlug(params.category);
    const location = getSeoLocationBySlug(params.location);
    if (!category || !location)
        return {};
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
    if (legacyRedirect)
        redirect(legacyRedirect);
    const category = getSeoCategoryBySlug(params.category);
    const location = getSeoLocationBySlug(params.location);
    if (!category || !location)
        notFound();
    const listings = await getSeoListings(category.label, location.label);
    return (<ReferencePage>
      <div>
        <BackButton href="/listings" label="Back to listings"/>
        <section>
          <h1>{category.label} listings in {location.label}</h1>
          <p>Active {category.label} listings near {location.label}, with Buy now and offer options, seller trust signals, and pickup, postage, or handover details kept in Messages.</p>
          <div><Link href={`/listings/c/${category.slug}`}>View all {category.label}</Link><Link href="/listings">Back to all listings</Link><Link href="/sell/new">List in {location.label}</Link></div>
        </section>

        <section>
          <div>
            {listings.length === 0 ? (<div>
                <div>
                  <div>No active {category.label} listings in {location.label} yet</div>
                  <p>No real seller has published this category and location combination yet. Create a buyer-ready listing if you have an item to sell nearby, or browse the wider category.</p>
                  <div>
                    <Link href="/sell/new">Create a listing</Link>
                    <Link href={`/listings/c/${category.slug}`}>View all {category.label}</Link>
                    <Link href="/listings">Browse all listings</Link>
                  </div>
                </div>
              </div>) : (listings.map(function (listing) {
            const listingType = (listing as {
                type?: string;
            }).type || "";
            const listingPrice = (listing as {
                price?: number;
            }).price ?? 0;
            const listingBuyNowPrice = (listing as {
                buyNowPrice?: number | null;
            }).buyNowPrice ?? null;
            const currentOffer = (listing as unknown as {
                currentOfferAmount?: number | null;
            }).currentOfferAmount ?? null;
            const displayPrice = listingType === "OFFERABLE"
                ? ((currentOffer ?? listingPrice) as number)
                : ((listingBuyNowPrice ?? listingPrice) as number);
            return (<ListingCard key={listing.id} listing={{
                    id: listing.id,
                    title: listing.title,
                    description: listing.description,
                    price: displayPrice,
                    buyNowPrice: listing.buyNowPrice,
                    type: (listing as {
                        type?: "BUY_NOW" | "OFFERABLE";
                    }).type ?? "BUY_NOW",
                    category: listing.category,
                    condition: listing.condition,
                    location: listing.location,
                    images: listing.images ?? null,
                    status: listing.status ?? "ACTIVE",
                    endsAt: null,
                    offerCount: (listing as unknown as {
                        _count?: {
                            offers?: number;
                        };
                    })._count?.offers ?? 0,
                    currentOffer,
                    seller: {
                        name: (listing as unknown as {
                            seller?: {
                                name?: string | null;
                                username?: string | null;
                            };
                        }).seller?.name || (listing as unknown as {
                            seller?: {
                                name?: string | null;
                                username?: string | null;
                            };
                        }).seller?.username || null,
                        memberSince: (listing as unknown as {
                            seller?: {
                                createdAt?: Date | null;
                            };
                        }).seller?.createdAt ?? null,
                        location: (listing as unknown as {
                            seller?: {
                                location?: string | null;
                            };
                        }).seller?.location ?? null,
                        emailVerified: (listing as unknown as {
                            seller?: {
                                emailVerified?: boolean | null;
                            };
                        }).seller?.emailVerified ?? false,
                        phone: (listing as unknown as {
                            seller?: {
                                phone?: string | null;
                            };
                        }).seller?.phone ?? null,
                    },
                }} initiallyWatched={false} viewerAuthed={false} showWatchButton={false}/>);
        }))}
          </div>
        </section>
      </div>
    </ReferencePage>);
}
