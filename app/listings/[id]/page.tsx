import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  return Array.from(new Set(images)).slice(0, 6);
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

  const title = cleanText(listing.title) || "Bidra listing";
  const description = cleanDescription(listing.description) || "No description provided. Message the seller before buying or making an offer.";
  const location = cleanText(listing.location) || "Location on request";
  const condition = cleanText(listing.condition) || "Condition not specified";
  const category = cleanText(listing.category) || "Listing";
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
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 text-[#0F172A] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/listings" className="text-sm font-bold text-[#4F46E5] underline underline-offset-4">Back to listings</Link>
          <Link href="/auth/login" className="rounded-2xl bg-[#4F46E5] px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-[#4338CA]">Sign in</Link>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-[#D8E1F0] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="border-b border-[#E2E8F0] bg-[#EEF4FF] p-8 lg:border-b-0 lg:border-r">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#D8E1F0] bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#475569]">{category}</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-800">{cleanText(listing.type) || "Buy now"}</span>
                {isSold ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-700">Sold</span> : null}
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">{title}</h1>
              <div className="mt-3 text-base font-bold text-[#475569]">{location}</div>

              <div className="mt-6 overflow-hidden rounded-[28px] border border-[#D8E1F0] bg-white">
                {primaryImage ? (
                  <img src={primaryImage} alt={title} className="h-72 w-full object-cover" loading="eager" />
                ) : (
                  <div className="flex h-72 items-center justify-center bg-[#F8FAFC] px-6 text-center text-sm font-bold text-[#64748B]">No listing image available</div>
                )}
                {images.length > 1 ? (
                  <div className="border-t border-[#E2E8F0] px-4 py-3 text-xs font-bold text-[#64748B]">{images.length} photos available</div>
                ) : null}
              </div>

              <div className="mt-8 rounded-[28px] border border-[#D8E1F0] bg-white p-6">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Price</div>
                <div className="mt-2 text-5xl font-black tracking-tight">{money(displayPrice)}</div>
                <div className="mt-4 rounded-2xl border border-blue-100 bg-[#EEF4FF] px-4 py-3 text-sm font-bold leading-6 text-[#0B3BB8]">
                  Sign in to contact the seller, save this listing, or continue with the purchase flow.
                </div>
              </div>
            </div>

            <aside className="p-6 sm:p-8">
              <div className="rounded-[28px] border border-[#D8E1F0] bg-[#F8FAFC] p-5">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Seller</div>
                <div className="mt-2 text-xl font-black">{sellerName}</div>
                <div className="mt-1 text-sm font-semibold text-[#64748B]">{sellerLocation}</div>
                <div className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-bold text-[#334155]">Member since {sellerJoined}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sellerBadges.length ? sellerBadges.map((badge) => (
                    <span key={badge} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">{badge}</span>
                  )) : (
                    <span className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-extrabold text-[#64748B]">Verification pending</span>
                  )}
                </div>
                <Link href={"/seller/" + listing.sellerId} className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-sm font-extrabold text-[#4F46E5] shadow-sm hover:bg-[#F8FAFC]">View seller profile</Link>
              </div>

              <div className="mt-4 grid gap-3">
                <Link href="/auth/login" className="inline-flex w-full items-center justify-center rounded-2xl bg-[#4F46E5] px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-[#4338CA]">Sign in to continue</Link>
                <Link href="/auth/login" className="inline-flex w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-sm font-extrabold text-[#4F46E5] shadow-sm hover:bg-[#F8FAFC]">Sign in to message seller</Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-[#D8E1F0] bg-white p-6 shadow-sm">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Description</div>
          <h2 className="mt-1 text-2xl font-black">About this item</h2>
          <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-[#1E293B]">{description}</p>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Condition</div>
            <div className="mt-2 text-lg font-black">{condition}</div>
          </div>
          <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Status</div>
            <div className="mt-2 text-lg font-black">{cleanText(listing.status)}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
