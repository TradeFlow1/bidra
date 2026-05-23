import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessageSellerButton from "./message-seller-button";
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
      location: true,
      status: true,
      images: true,
      sellerId: true,
      seller: {
        select: {
          id: true,
          name: true,
          username: true,
          location: true,
          createdAt: true,
          emailVerified: true,
          phoneVerified: true,
        },
      },
    },
  });

  if (!listing) notFound();

  const relatedListings = await prisma.listing.findMany({
    where: {
      id: { not: listing.id },
      status: "ACTIVE",
      category: listing.category || undefined,
    },
    select: {
      id: true,
      title: true,
      price: true,
      buyNowPrice: true,
      location: true,
      condition: true,
      images: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const title = cleanText(listing.title) || "Bidra listing";
  const description = cleanDescription(listing.description) || "No description provided. Message the seller before buying or making an offer.";
  const location = cleanText(listing.location) || "Location on request";
  const condition = cleanText(listing.condition) || "Condition not specified";
  const category = cleanText(listing.category) || "Listing";
  const listingType = cleanText(listing.type) || "Buy now";
  const sellerName = cleanText(listing.seller?.name || listing.seller?.username) || "Bidra seller";
  const sellerLocation = cleanText(listing.seller?.location) || "Australia";
  const sellerJoined = listing.seller?.createdAt instanceof Date
    ? listing.seller.createdAt.toLocaleDateString("en-AU", { month: "short", year: "numeric" })
    : "Recently";
  const sellerBadges = [
    listing.seller?.emailVerified ? "Email verified" : "",
    listing.seller?.phoneVerified ? "Phone verified" : "",
  ].filter(Boolean);
  const displayPrice = typeof listing.buyNowPrice === "number" ? listing.buyNowPrice : listing.price;
  const isSold = listing.status !== "ACTIVE";
  const images = safeListingImages(listing.images);
  const primaryImage = images[0] || "";

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#080D32] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8 flex flex-wrap items-center gap-3 text-sm font-bold text-[#4B5B8F]">
          <Link href="/" className="text-[#352CFF] hover:underline">Home</Link>
          <span className="text-[#A8B1CC]">›</span>
          <Link href="/listings" className="text-[#352CFF] hover:underline">Listings</Link>
          <span className="text-[#A8B1CC]">›</span>
          <span>{category}</span>
        </nav>

        <section className="grid gap-10 lg:grid-cols-[1.28fr_0.92fr] lg:items-start">
          <div>
            <div className="overflow-hidden rounded-2xl border border-[#E1E7F5] bg-[#F6F8FC] shadow-sm">
              {primaryImage ? (
                <div className="relative h-[320px] w-full sm:h-[420px] lg:h-[470px]">
                  <Image src={primaryImage} alt={title} fill sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover" priority />
                </div>
              ) : (
                <div className="flex h-[320px] items-center justify-center px-6 text-center text-sm font-bold text-[#667399] sm:h-[420px] lg:h-[470px]">No listing image available</div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {(images.length ? images : [""]).slice(0, 8).map((image, index) => (
                <div key={image || String(index)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#DFE6F6] bg-white shadow-sm">
                  {image ? <span className="h-3 w-3 rounded border-2 border-[#352CFF]" /> : <span className="h-3 w-3 rounded border-2 border-[#A8B1CC]" />}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[#DFE6F6] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
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
                <div className="grid gap-3 sm:w-[320px] sm:grid-cols-2">
                  <Link href={"/seller/" + listing.sellerId} className="inline-flex items-center justify-center rounded-xl border border-[#352CFF] px-5 py-3 text-sm font-extrabold text-[#352CFF] hover:bg-[#F5F3FF]">View profile</Link>
                  <MessageSellerButton listingId={listing.id} />
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:pt-1">
            <div className="flex flex-wrap gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#667399]">
              <span>{category}</span>
              <span>•</span>
              <span>{listingType}</span>
              {isSold ? <><span>•</span><span>Sold</span></> : null}
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-[#080D32] sm:text-5xl">{title}</h1>
            <div className="mt-4 text-4xl font-black tracking-tight">{money(displayPrice)}</div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-base font-bold text-[#667399]">
              <span>{location}</span>
              <span>•</span>
              <span>{cleanText(listing.status)}</span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link href={"/auth/login?next=/listings/" + listing.id} className="inline-flex h-14 items-center justify-center rounded-xl bg-[#352CFF] px-6 text-base font-extrabold text-white shadow-sm hover:bg-[#2B23D9]">Buy now</Link>
              <Link href={"/auth/login?next=/listings/" + listing.id} className="inline-flex h-14 items-center justify-center rounded-xl border border-[#352CFF] bg-white px-6 text-base font-extrabold text-[#352CFF] shadow-sm hover:bg-[#F5F3FF]">Make an offer</Link>
            </div>

            <div className="mt-4 grid gap-3">
              <WatchlistButton listingId={listing.id} authed={!!userId} loginHref={"/auth/login?next=/listings/" + listing.id} />
            </div>

            <div className="mt-8 border-y border-[#DFE6F6] py-6">
              <dl className="grid grid-cols-[130px_1fr] gap-x-6 gap-y-4 text-sm">
                <dt className="font-bold text-[#667399]">Condition</dt>
                <dd className="font-extrabold text-[#080D32]">{condition}</dd>
                <dt className="font-bold text-[#667399]">Category</dt>
                <dd className="font-extrabold text-[#080D32]">{category}</dd>
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
              <ReportListingButton listingId={listing.id} />
            </div>
          </aside>
        </section>

        {relatedListings.length ? (
          <section className="mt-12">
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
                  <Link key={item.id} href={"/listings/" + item.id} className="group overflow-hidden rounded-2xl border border-[#DFE6F6] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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
