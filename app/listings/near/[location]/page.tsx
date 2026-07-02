import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingCard from "@/components/listing-card";
import { BackButton } from "@/components/ui/back-button";
import { EmptyMarketplaceState, ReferencePage, appShell } from "@/components/marketplace-redesign";
import { getSeoLocationBySlug, getSeoLocationListings, getSiteUrl } from "@/lib/listing-seo";
type Props = {
    params: {
        location: string;
    };
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const location = getSeoLocationBySlug(params.location);
    if (!location)
        return {};
    const placeLabel = location.state ? `${location.label}, ${location.state}` : location.label;
    const title = `Marketplace listings near ${placeLabel} | Bidra`;
    const description = `Browse active marketplace listings near ${placeLabel} on Bidra. Find Buy now and offer listings with seller trust signals and clear pickup, postage or handover guidance.`;
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
    if (!location)
        notFound();
    const placeLabel = location.state ? `${location.label}, ${location.state}` : location.label;
    const listings = await getSeoLocationListings(location.label);
    return (<ReferencePage>
      <div>
        <BackButton href="/listings" label="Back to listings"/>

        <section>
          <div>Local marketplace</div>
          <h1>Marketplace listings near {placeLabel}</h1>
          <p>
            Browse local listings near {placeLabel}. Buyers and sellers use Bidra to find listings, ask questions, make offers and keep handover details in Messages.
          </p>
          <div>
            <Link href="/listings">Browse all listings</Link>
            <Link href={`/listings?location=${encodeURIComponent(location.label)}`}>Search {location.label}</Link>
            <Link href="/sell/new">List in {location.label}</Link>
          </div>
        </section>

        <section>
          <div>
            <div>
              <h2>Active listings</h2>
              <span>{listings.length} found</span>
            </div>
            <div>
              {listings.length === 0 ? (<div>
                  <EmptyMarketplaceState title={`No active listings near ${location.label} yet`} body="No real seller has published a matching local listing yet. Create a buyer-ready listing with clear photos, price, condition and handover details." href="/sell/new" cta="Create a listing"/>
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
          </div>

          <aside>
            <div>Local safety</div>
            <h2>Agree handover details clearly</h2>
            <ul>
              <li>Keep conversations in Bidra Messages.</li>
              <li>Confirm pickup, postage or delivery directly with the other person.</li>
              <li>Inspect items before paying where practical.</li>
              <li>Report unsafe listings or unusual requests.</li>
            </ul>
          </aside>
        </section>
      </div>
    </ReferencePage>);
}
