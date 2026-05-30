import Image from "next/image";
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

function safeListingImages(value: unknown) {
  const images: string[] = [];

  function addImage(item: unknown) {
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
        images.push(trimmed);
      }
    }
    if (item && typeof item === "object" && "url" in item) {
      addImage((item as { url?: unknown }).url);
    }
  }

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
  }

  return Array.from(new Set(images)).slice(0, 8);
}

export async function generateMetadata() {
  return {
    title: "Listing | Bidra",
    description: "View this listing on Bidra.",
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
      type: true,
      category: true,
      condition: true,
      attributes: true,
      location: true,
      status: true,
      images: true,
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
        },
      },
    },
  });

  if (!listing) notFound();

  const relatedSelect = {
    id: true,
    title: true,
    price: true,
    buyNowPrice: true,
    location: true,
    condition: true,
    images: true,
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

  const fallbackListings = sameCategoryListings.length >= 5 ? [] : await prisma.listing.findMany({
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
  const listingType = cleanText(listing.type) || "Buy now";
  const sellerName = cleanText(listing.seller?.name || listing.seller?.username) || "Bidra seller";
  const sellerInitials = sellerName.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "B";
  const sellerAvatarUrl = cleanText(listing.seller?.avatarUrl);
  const sellerLocation = cleanText(listing.seller?.location) || "Australia";
  const sellerJoined = listing.seller?.createdAt instanceof Date
    ? listing.seller.createdAt.toLocaleDateString("en-AU", { month: "short", year: "numeric" })
    : "Recently";
  const sellerBadges = [
    listing.seller?.emailVerified ? "Email verified" : "",
    listing.seller?.phoneVerified ? "Phone verified" : "",
  ].filter(Boolean);
  const displayPrice = typeof listing.buyNowPrice === "number" ? listing.buyNowPrice : listing.price;
  const buyNowAmount = listing.type === "BUY_NOW" ? listing.price : (typeof listing.buyNowPrice === "number" ? listing.buyNowPrice : null);
  const isOwner = !!userId && userId === listing.sellerId;
  const canBuyNow = listing.status === "ACTIVE" && buyNowAmount !== null && !isOwner;
  const canOffer = listing.status === "ACTIVE" && listing.type === "OFFERABLE" && !isOwner;
  const minOfferCents = Math.max(1, Number(listing.price || 0));
  const isSold = listing.status !== "ACTIVE";
  const attributeRows = listingAttributeRows(listing.attributes);
  const images = safeListingImages(listing.images);
  const primaryImage = images[0] || "";

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#080D32] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <nav className="mb-8 flex flex-wrap items-center gap-3 text-sm font-bold text-[#4B5B8F]">
          <Link href="/" className="text-[#352CFF] hover:underline">Home</Link>
          <span className="text-[#A8B1CC]">â€º</span>
          <Link href="/listings" className="text-[#352CFF] hover:underline">Listings</Link>
          <span className="text-[#A8B1CC]">â€º</span>
          <span>{category}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-start xl:gap-12">
          <div>
            <div className="overflow-hidden rounded-2xl border border-[#E1E7F5] bg-white shadow-sm">
              {primaryImage ? (
                <div className="relative h-[340px] w-full sm:h-[460px] lg:h-[520px]">
                  <Image src={primaryImage} alt={title} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-contain p-6" priority />
                </div>
              ) : (
                <div className="flex h-[340px] items-center justify-center px-6 text-center text-sm font-bold text-[#667399] sm:h-[460px] lg:h-[520px]">No listing image available</div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {(images.length ? images : [""]).slice(0, 8).map((image, index) => (
                <div key={image || String(index)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#DFE6F6] bg-white shadow-sm">
                  {image ? <span className="h-3 w-3 rounded border-2 border-[#352CFF]" /> : <span className="h-3 w-3 rounded border-2 border-[#A8B1CC]" />}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[#DFE6F6] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#DFE6F6] bg-[#EEF2FF] text-2xl font-black text-[#352CFF] shadow-sm">
                    {sellerAvatarUrl ? <Image src={sellerAvatarUrl} alt={sellerName} width={80} height={80} className="h-full w-full object-cover" /> : sellerInitials}
                  </div>
                  <div>
                    <div className="text-xl font-black">{sellerName}</div>
                    <div className="mt-1 text-sm font-semibold text-[#667399]">{sellerLocation}</div>
                    <div className="mt-1 text-sm font-semibold text-[#667399]">Member since {sellerJoined}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                    {sellerBadges.length ? sellerBadges.map((badge) => (
                      <span key={badge} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">{badge}</span>
                    )) : (
                      <span className="rounded-full border border-[#DFE6F6] bg-white px-3 py-1 text-xs font-extrabold text-[#667399]">Verification pending</span>
                    )}
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:w-[320px] sm:grid-cols-2">
                  <Link href={"/seller/" + listing.sellerId} className="inline-flex items-center justify-center rounded-xl border border-[#352CFF] px-5 py-3 text-sm font-extrabold text-[#352CFF]">View profile</Link>
                  <MessageSellerButton listingId={listing.id} />
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:pt-2">
            <div className="flex flex-wrap gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#667399]">
              <span>{category}</span>
              <span>·</span>
              <span>{listingType}</span>
              {isSold ? <><span>·</span><span>Sold</span></> : null}
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-[#080D32] sm:text-5xl lg:text-[52px]">{title}</h1>
            <div className="mt-4 text-4xl font-black tracking-tight">{money(displayPrice)}</div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-base font-bold text-[#667399]">
              <span>{location}</span>
              <span>·</span>
              <span>{cleanText(listing.status)}</span>
            </div>

            <div className={canBuyNow && canOffer ? "mt-8 grid gap-4 sm:grid-cols-2" : "mt-8 grid gap-4"}>
              {canBuyNow ? <BuyNowButton listingId={listing.id} /> : null}
              {canOffer ? <PlaceOfferClient listingId={listing.id} minOfferCents={minOfferCents} /> : null}
            </div>

            {isOwner ? (
              <div className="mt-6 rounded-2xl border border-[#D8E1F0] bg-[#F8FAFF] p-4 shadow-sm">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#4F46E5]">Seller tools</div>
                <div className="mt-2 text-sm font-semibold text-[#667399]">Manage this listing from your seller view.</div>
                <Link href={"/sell/edit/" + params.id} className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-[#4F46E5]/30 bg-white px-5 text-sm font-black text-[#2437FF] shadow-sm transition hover:bg-[#F8FAFF]">
                  Edit listing
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                <WatchlistButton listingId={listing.id} authed={!!userId} loginHref={"/auth/login?next=/listings/" + listing.id} />
              </div>
            )}

            <div className="mt-8 border-y border-[#DFE6F6] py-6">
              <dl className="grid grid-cols-[130px_1fr] gap-x-6 gap-y-4 text-sm">
                <dt className="font-bold text-[#667399]">Condition</dt>
                <dd className="font-extrabold text-[#080D32]">{condition}</dd>
                <dt className="font-bold text-[#667399]">Category</dt>
                <dd className="font-extrabold text-[#080D32]">{category}</dd>
                {attributeRows.map((row) => (
                  <Fragment key={row.key}>
                    <dt className="font-bold text-[#667399]">{row.label}</dt>
                    <dd className="font-extrabold text-[#080D32]">{row.value}</dd>
                  </Fragment>
                ))}
                <dt className="font-bold text-[#667399]">Listing type</dt>
                <dd className="font-extrabold text-[#080D32]">{listingType}</dd>
                <dt className="font-bold text-[#667399]">Status</dt>
                <dd className="font-extrabold text-[#080D32]">{cleanText(listing.status)}</dd>
              </dl>
            </div>

            <div className="mt-6">
              <p className="whitespace-pre-wrap text-base leading-8 text-[#26345F]">{description}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="inline-flex rounded-full border border-[#080D32] bg-white px-4 py-2 text-sm font-extrabold text-[#080D32] shadow-sm hover:bg-[#F8FAFC]">
                <ReportListingButton listingId={listing.id} />
              </div>
            </div>
          </aside>
        </section>

        {relatedListings.length ? (
          <section className="mt-12 max-w-[880px]">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-3xl font-black tracking-tight">You may also like</h2>
              <Link href="/listings" className="text-sm font-extrabold text-[#352CFF] hover:underline">Browse all</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {relatedListings.map((item) => {
                const itemTitle = cleanText(item.title) || "Bidra listing";
                const itemImages = safeListingImages(item.images);
                const itemPrice = typeof item.buyNowPrice === "number" ? item.buyNowPrice : item.price;
                return (
                  <Link key={item.id} href={"/listings/" + item.id} className="group overflow-hidden rounded-2xl border border-[#DFE6F6] bg-white shadow-sm transition">
                    {itemImages[0] ? (
                      <div className="relative h-44 w-full bg-[#F6F8FC]">
                        <Image src={itemImages[0]} alt={itemTitle} fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-44 items-center justify-center bg-[#F6F8FC] px-4 text-center text-xs font-bold text-[#667399]">No image</div>
                    )}
                    <div className="p-4">
                      <div className="line-clamp-2 text-sm font-black text-[#080D32]">{itemTitle}</div>
                      <div className="mt-2 text-base font-black text-[#080D32]">{money(itemPrice)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
