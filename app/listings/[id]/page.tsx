import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BuyNowButton from "./buy-now-button";
import MessageSellerButton from "./message-seller-button";
import PlaceOfferClient from "./place-offer-client";
import ReportListingButton from "./report-listing-button";
import WatchlistButton from "./watchlist-button";
import ListingImageGallery from "@/components/listing-image-gallery";
import ListingCard from "@/components/listing-card";
import { getBaseUrl } from "@/lib/base-url";
import { BuyerSafetyCard, DescriptionCard, ListingBreadcrumbs, ListingOfferSummary, SellerCard } from "@/components/listing-detail";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function cleanText(value: unknown) {
  return String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

function money(cents: unknown) {
  const value = typeof cents === "number" && Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value / 100);
}

function cleanDescription(value: unknown) {
  return cleanText(value)
    .replace(/Selling:\s*/gi, "")
    .replace(/Condition:\s*/gi, "")
    .replace(/Details:\s*/gi, "")
    .trim();
}

function labelForAttribute(key: string) {
  const labels: Record<string, string> = {
    make: "Make",
    model: "Model",
    year: "Year",
    odometer: "Odometer",
    transmission: "Transmission",
    fuelType: "Fuel type",
    bodyType: "Body type",
    registration: "Registration",
    brand: "Brand",
    storage: "Storage / capacity",
    colour: "Colour",
  };
  return labels[key] || key;
}

function listingAttributeRows(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const order = ["make", "brand", "model", "year", "odometer", "transmission", "fuelType", "bodyType", "registration", "storage", "colour"];
  const raw = value as Record<string, unknown>;
  const rows: { key: string; label: string; value: string }[] = [];

  for (const key of order) {
    const text = cleanText(raw[key]);
    if (!text) continue;
    rows.push({ key, label: labelForAttribute(key), value: text });
  }

  return rows;
}

function isSafeImageUrl(value: unknown) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function safeListingImages(...values: unknown[]) {
  const images: string[] = [];

  function addImage(item: unknown) {
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (isSafeImageUrl(trimmed)) images.push(trimmed);
      return;
    }

    if (item && typeof item === "object" && "url" in item) {
      addImage((item as { url?: unknown }).url);
    }
  }

  for (const value of values) {
    if (Array.isArray(value)) {
      for (const item of value) addImage(item);
    } else if (typeof value === "string" && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          for (const item of parsed) addImage(item);
        } else {
          addImage(value);
        }
      } catch {
        addImage(value);
      }
    } else {
      addImage(value);
    }
  }

  return Array.from(new Set(images)).slice(0, 8);
}

function formatFulfillment(value: unknown) {
  const raw = cleanText(value).toUpperCase();
  if (raw === "POSTAGE") return "Postage available";
  if (raw === "DELIVERY") return "Delivery available";
  return "Pickup with seller";
}

function saleTypeLabel(value: unknown, buyNowPrice?: number | null) {
  const raw = cleanText(value).toUpperCase();
  if (raw === "OFFERABLE" && typeof buyNowPrice === "number") return "Offers + buy now";
  if (raw === "OFFERABLE") return "Make an offer";
  return "Buy now";
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      images: true,
      photos: true,
      status: true,
      location: true,
      price: true,
      buyNowPrice: true,
    },
  });

  if (!listing) {
    return {
      title: "Listing not found | Bidra",
      description: "This Bidra listing is not available.",
      robots: { index: false, follow: true },
    };
  }

  const title = cleanText(listing.title) || "Bidra listing";
  const price = money(typeof listing.buyNowPrice === "number" ? listing.buyNowPrice : listing.price);
  const location = cleanText(listing.location);
  const description = cleanDescription(listing.description) ||
    "View photos, price, seller profile, and contact options for this Bidra listing.";
  const canonicalPath = "/listings/" + listing.id;
  const url = getBaseUrl().replace(/\/+$/, "") + canonicalPath;
  const images = safeListingImages(listing.images, listing.photos).slice(0, 4);
  const metaDescription = `${price}${location ? " in " + location : ""}. ${description}`.slice(0, 180);

  return {
    title: title + " | Bidra",
    description: metaDescription,
    alternates: { canonical: canonicalPath },
    robots: listing.status === "ACTIVE" ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: "article",
      url,
      title: title + " | Bidra",
      description: metaDescription,
      images,
    },
    twitter: {
      card: images.length ? "summary_large_image" : "summary",
      title: title + " | Bidra",
      description: metaDescription,
      images,
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const userId = session?.user?.id || "";

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      buyNowPrice: true,
      currentOfferAmount: true,
      currentOfferBuyerId: true,
      viewCount: true,
      type: true,
      category: true,
      condition: true,
      attributes: true,
      location: true,
      fulfillmentType: true,
      status: true,
      images: true,
      photos: true,
      sellerId: true,
      seller: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          location: true,
          createdAt: true,
          emailVerified: true,
          phoneVerified: true,
          _count: {
            select: {
              feedbackReceived: true,
              listings: true,
            },
          },
        },
      },
    },
  });

  if (!listing) notFound();

  const isOwner = !!userId && userId === listing.sellerId;
  const currentViewCount = Number.isFinite(Number(listing.viewCount)) ? Number(listing.viewCount) : 0;
  const displayedViewCount = isOwner ? currentViewCount : currentViewCount + 1;

  if (!isOwner && listing.status === "ACTIVE") {
    try {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { viewCount: { increment: 1 } },
      });
    } catch (err) {
      console.error("Listing view count update failed", { listingId: listing.id, err });
    }
  }

  const relatedSelect = {
    id: true,
    title: true,
    description: true,
    price: true,
    buyNowPrice: true,
    currentOfferAmount: true,
    currentOfferBuyerId: true,
    type: true,
    category: true,
    location: true,
    condition: true,
    images: true,
    photos: true,
    status: true,
    createdAt: true,
    offers: { orderBy: { amount: "desc" as const }, take: 1, select: { amount: true, expiresAt: true } },
    _count: { select: { offers: true } },
    seller: { select: { username: true, name: true, createdAt: true, location: true, emailVerified: true, phoneVerified: true, phone: true } },
  };

  const sameCategoryListings = await prisma.listing.findMany({
    where: {
      id: { not: listing.id },
      status: "ACTIVE",
      category: listing.category || undefined,
    },
    select: relatedSelect,
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const fallbackListings = await prisma.listing.findMany({
    where: {
      id: { notIn: [listing.id].concat(sameCategoryListings.map((item) => item.id)) },
      status: "ACTIVE",
    },
    select: relatedSelect,
    orderBy: { createdAt: "desc" },
    take: 5 - sameCategoryListings.length,
  });

  const relatedListings = sameCategoryListings.concat(fallbackListings);

  const title = cleanText(listing.title) || "Bidra listing";
  const description = cleanDescription(listing.description) || "No description provided. Message the seller before buying or making an offer.";
  const location = cleanText(listing.location) || "Location on request";
  const condition = cleanText(listing.condition) || "Condition not specified";
  const category = cleanText(listing.category) || "Listing";
  const listingType = saleTypeLabel(listing.type, listing.buyNowPrice);
  const fulfillmentLabel = formatFulfillment(listing.fulfillmentType);
  const sellerName = cleanText(listing.seller?.name || listing.seller?.username) || "Bidra seller";
  const sellerInitials = sellerName.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "B";
  const sellerAvatarUrl = isSafeImageUrl(cleanText(listing.seller?.avatarUrl)) ? cleanText(listing.seller?.avatarUrl) : "";
  const sellerLocation = cleanText(listing.seller?.location) || "Australia";
  const sellerJoined = listing.seller?.createdAt instanceof Date
    ? listing.seller.createdAt.toLocaleDateString("en-AU", { month: "short", year: "numeric" })
    : "Recently";
  const sellerFeedbackCount = listing.seller?._count?.feedbackReceived ?? 0;
  const sellerListingCount = listing.seller?._count?.listings ?? 0;
  const sellerBadges = [
    listing.seller?.emailVerified ? "Email verified" : "",
    listing.seller?.phoneVerified ? "Phone verified" : "",
  ].filter(Boolean);
  const displayPrice = listing.type === "OFFERABLE"
    ? (typeof listing.currentOfferAmount === "number" ? listing.currentOfferAmount : listing.price)
    : (typeof listing.buyNowPrice === "number" ? listing.buyNowPrice : listing.price);
  const buyNowAmount = listing.type === "BUY_NOW" ? listing.price : (typeof listing.buyNowPrice === "number" ? listing.buyNowPrice : null);
  const canBuyNow = listing.status === "ACTIVE" && buyNowAmount !== null && !isOwner;
  const canOffer = listing.status === "ACTIVE" && listing.type === "OFFERABLE" && !!userId && !isOwner;
  const showOfferLogin = listing.status === "ACTIVE" && listing.type === "OFFERABLE" && !userId;
  const minOfferCents = Math.max(1, Number(listing.price || 0));
  const isSold = listing.status !== "ACTIVE";
  const attributeRows = listingAttributeRows(listing.attributes);
  const images = safeListingImages(listing.images, listing.photos);

  return (
    <main className="bd-listing-detail-page min-h-screen bg-[#FBF9FF] px-4 py-8 text-[#120724] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px] pb-24">
        <ListingBreadcrumbs category={category} />

        <section className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-start xl:gap-12">
          <div>
            <ListingImageGallery images={images} title={title} />

            <SellerCard
              sellerName={sellerName}
              sellerInitials={sellerInitials}
              sellerAvatarUrl={sellerAvatarUrl}
              sellerLocation={sellerLocation}
              sellerJoined={sellerJoined}
              sellerBadges={sellerBadges}
              sellerFeedbackCount={sellerFeedbackCount}
              sellerListingCount={sellerListingCount}
              fulfillmentLabel={fulfillmentLabel}
              sellerHref={"/seller/" + listing.sellerId}
              messageAction={<MessageSellerButton listingId={listing.id} />}
            />
          </div>

          <aside className="bd-listing-action-panel lg:sticky lg:top-28 lg:pt-2">
            <div className="flex flex-wrap gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#7C3AED]">
              <span>{category}</span>
              <span>-</span>
              <span>{listingType}</span>
              <span>-</span>
              <span>{fulfillmentLabel}</span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.055em] text-[#120724] sm:text-5xl lg:text-[52px]">{title}</h1>
            <div className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#120724]">{money(displayPrice)}</div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-base font-bold text-[#62516F]">
              <span>{location}</span>
              <span>-</span>
              <span>{cleanText(listing.status)}</span>
              <span>-</span>
              <span>{displayedViewCount.toLocaleString("en-AU")} views</span>
            </div>

            <div className={canBuyNow && canOffer ? "mt-8 grid gap-4 sm:grid-cols-2" : "mt-8 grid gap-4"}>
              {canBuyNow ? <BuyNowButton listingId={listing.id} /> : null}
              {canOffer ? <PlaceOfferClient listingId={listing.id} minOfferCents={minOfferCents} /> : null}
              {showOfferLogin ? (
                <Link
                  href={"/auth/login?next=/listings/" + listing.id}
                  className="bd-btn bd-btn-primary w-full rounded-2xl text-center"
                >
                  Log in to make an offer
                </Link>
              ) : null}
            </div>

            {isOwner ? (
              <div className="mt-6 rounded-[24px] border border-[#DDD6FE] bg-white p-4 shadow-[0_14px_40px_rgba(43,16,85,0.06)]">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7C3AED]">Seller tools</div>
                <div className="mt-2 text-sm font-semibold text-[#62516F]">Manage this listing from your seller view.</div>
                <Link href={"/sell/edit/" + params.id} className="bd-btn bd-btn-secondary mt-4 h-12 w-full rounded-2xl px-5 text-sm">
                  Edit listing
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                <WatchlistButton listingId={listing.id} authed={!!userId} loginHref={"/auth/login?next=/listings/" + listing.id} />
              </div>
            )}

            <BuyerSafetyCard />

            <div className="mt-8 rounded-[24px] border border-[#EDE9FE] bg-white p-5 shadow-[0_14px_40px_rgba(43,16,85,0.06)]">
              <dl className="grid grid-cols-[130px_1fr] gap-x-6 gap-y-4 text-sm">
                <dt className="font-bold text-[#62516F]">Condition</dt>
                <dd className="font-extrabold text-[#120724]">{condition}</dd>
                <dt className="font-bold text-[#62516F]">Category</dt>
                <dd className="font-extrabold text-[#120724]">{category}</dd>
                <dt className="font-bold text-[#62516F]">Handover</dt>
                <dd className="font-extrabold text-[#120724]">{fulfillmentLabel}</dd>
                {attributeRows.map((row) => (
                  <Fragment key={row.key}>
                    <dt className="font-bold text-[#62516F]">{row.label}</dt>
                    <dd className="font-extrabold text-[#120724]">{row.value}</dd>
                  </Fragment>
                ))}
                <dt className="font-bold text-[#62516F]">Listing type</dt>
                <dd className="font-extrabold text-[#120724]">{listingType}</dd>
                <dt className="font-bold text-[#62516F]">Status</dt>
                <dd className="font-extrabold text-[#120724]">{cleanText(listing.status)}</dd>
                <dt className="font-bold text-[#62516F]">Views</dt>
                <dd className="font-extrabold text-[#120724]">{displayedViewCount.toLocaleString("en-AU")}</dd>
              </dl>
            </div>

            <DescriptionCard description={description} />

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="inline-flex rounded-full border border-[#DDD6FE] bg-white px-4 py-2 text-sm font-extrabold text-[#120724] shadow-sm hover:bg-[#F5F3FF]">
                <ReportListingButton listingId={listing.id} />
              </div>
            </div>
          </aside>
        </section>

        {relatedListings.length ? (
          <section className="mt-12">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7C3AED]">Keep browsing</div>
                <h2 className="mt-1 text-3xl font-black tracking-[-0.045em] text-[#120724]">You may also like</h2>
              </div>
              <Link href="/listings" className="text-sm font-extrabold text-[#6D28D9] hover:underline">Browse all</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {relatedListings.map((item) => {
                const itemPrice = item.type === "OFFERABLE"
                  ? (typeof item.offers?.[0]?.amount === "number" ? item.offers[0].amount : item.price)
                  : (typeof item.buyNowPrice === "number" ? item.buyNowPrice : item.price);
                return (
                  <ListingCard
                    key={item.id}
                    listing={{
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      price: itemPrice,
                      buyNowPrice: item.buyNowPrice,
                      type: item.type,
                      category: item.category,
                      condition: item.condition,
                      location: item.location,
                      images: item.images ?? item.photos ?? null,
                      status: item.status,
                      offerCount: item._count?.offers ?? 0,
                      currentOffer: item.offers?.[0]?.amount ?? item.currentOfferAmount ?? null,
                      endsAt: item.offers?.[0]?.expiresAt ?? null,
                      createdAt: item.createdAt,
                      seller: {
                        name: item.seller?.name || item.seller?.username || null,
                        memberSince: item.seller?.createdAt ?? null,
                        location: item.seller?.location ?? null,
                        emailVerified: item.seller?.emailVerified ?? false,
                        phoneVerified: item.seller?.phoneVerified ?? false,
                        phone: item.seller?.phone ?? null,
                      },
                    }}
                    viewerAuthed={!!userId}
                    showWatchButton={false}
                  />
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
