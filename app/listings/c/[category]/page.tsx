import Link from "next/link";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ListingCard from "@/components/listing-card";
import { getSeoCategoryBySlug, getSeoCategoryLocationLinks, getSeoListings, getSiteUrl } from "@/lib/listing-seo";
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
    };
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    if (legacyCategoryRedirects[params.category])
        return {};
    const category = getSeoCategoryBySlug(params.category);
    if (!category)
        return {};
    const title = `${category.label} listings | Bidra`;
    const description = `Browse active ${category.label} listings on Bidra by location, price, condition, and seller trust signals. Buy now or make offers with handover details kept in Messages.`;
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
    const legacyRedirect = legacyCategoryRedirects[params.category];
    if (legacyRedirect)
        redirect(legacyRedirect);
    const category = getSeoCategoryBySlug(params.category);
    if (!category)
        notFound();
    const [listings, locationLinks] = await Promise.all([
        getSeoListings(category.label),
        getSeoCategoryLocationLinks(category.label),
    ]);
    return (<ReferencePage>
      <div>
        <BackButton href="/listings" label="Back to listings"/>
        <section>
          <h1>{category.label} listings</h1>
          <p>Browse active {category.label} listings on Bidra by location, price, condition, and seller trust signals. Buy now or make offers, then keep pickup, postage, and handover details in Messages.</p>
          <div>
            <div><Link href="/listings">Back to all listings</Link><Link href="/sell/new">List in this category</Link></div>
          </div>
        </section>

        {locationLinks.length ? (<section>
            <h2>Browse {category.label} by location</h2>
            <div>
              {locationLinks.map(function (location) {
                return (<Link key={location.slug} href={`/listings/c/${category.slug}/${location.slug}`}>
                    {location.label}
                  </Link>);
            })}
            </div>
          </section>) : null}

        <section>
          <div>
            {listings.length === 0 ? (<div>
                <div>No active {category.label} listings right now</div>
                <p>No real seller has published an active {category.label} listing yet. Browse all listings or create a buyer-ready listing in this category if you have an item to sell.</p><div><Link href="/sell/new">Create a {category.label} listing</Link><Link href="/listings">Browse all listings</Link></div>
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
