import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import { CATEGORY_GROUPS } from "@/lib/categories";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "Bidra marketplace | Buy Now and offers in Australia",
  description: "Browse Bidra for Australian marketplace listings, Buy Now items, offers, pickup, postage, and local handover details.",
  alternates: { canonical: "/" },
  keywords: [
    "Australian marketplace",
    "local marketplace Australia",
    "Buy Now listings",
    "marketplace offers",
    "local selling",
    "Bidra marketplace",
  ],
  openGraph: {
    title: "Bidra marketplace | Buy Now and offers in Australia",
    description: "Find active Australian marketplace listings by category and location, compare Buy Now and offer listings, and keep handover details in Bidra Messages.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bidra marketplace | Buy Now and offers in Australia",
    description: "Browse local listings, Buy Now items, and offers on Bidra.",
  },
};

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const siteUrl = "https://bidra.com.au";
  const marketplaceJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Bidra",
        url: siteUrl,
        logo: `${siteUrl}/brand/bidra-symbol.svg`,
        areaServed: "AU",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "Bidra",
        url: siteUrl,
        inLanguage: "en-AU",
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/listings?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#marketplace-list`,
        name: "Active Bidra marketplace listings",
        description: "Australian marketplace landing page for Buy Now listings, offers, local pickup, postage, and handover details in Messages.",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Browse listings", url: `${siteUrl}/listings` },
          { "@type": "ListItem", position: 2, name: "Buy Now listings", url: `${siteUrl}/listings?type=BUY_NOW` },
          { "@type": "ListItem", position: 3, name: "Offer listings", url: `${siteUrl}/listings?type=OFFERABLE` },
        ],
      },
    ],
  };

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      orders: { none: {} },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      location: true,
      type: true,
      condition: true,
      status: true,
      price: true,
      buyNowPrice: true,
      createdAt: true,
      images: true,
      offers: {
        orderBy: { amount: "desc" },
        take: 1,
        select: { amount: true },
      },
      _count: {
        select: { offers: true },
      },
      seller: {
        select: {
          username: true,
          name: true,
          createdAt: true,
          location: true,
          emailVerified: true,
          phone: true,
        },
      },
    },
  });

  const categoryRows = await prisma.listing.groupBy({
    by: ["category"],
    where: {
      status: "ACTIVE",
      orders: { none: {} },
    },
    _count: { category: true },
    orderBy: { _count: { category: "desc" } },
    take: 24,
  });

  const watchedSet = new Set<string>();
  if (userId && listings.length) {
    const watchRows = await prisma.watchlist.findMany({
      where: {
        userId: userId,
        listingId: { in: listings.map((l) => String(l.id)) },
      },
      select: { listingId: true },
    });
    for (let i = 0; i < watchRows.length; i += 1) {
      watchedSet.add(String(watchRows[i].listingId));
    }
  }

  const topLevelCategoryCounts = new Map<string, number>();
  for (let i = 0; i < categoryRows.length; i += 1) {
    const raw = String(categoryRows[i].category || "").trim();
    if (!raw) continue;
    const top = raw.indexOf(" > ") >= 0 ? raw.split(" > ")[0] : raw;
    topLevelCategoryCounts.set(top, (topLevelCategoryCounts.get(top) || 0) + Number(categoryRows[i]._count.category || 0));
  }
  const latestListings = listings.slice(0, 12);

  function renderCard(l: (typeof listings)[number]) {
    const currentOffer = l.offers && l.offers.length ? l.offers[0].amount : null;
    const displayPrice = l.type === "OFFERABLE"
      ? ((currentOffer ?? l.price) as number)
      : ((l.buyNowPrice ?? l.price) as number);

    return (
      <ListingCard
        key={l.id}
        listing={{
          id: l.id,
          title: l.title,
          description: l.description,
          price: displayPrice,
          buyNowPrice: l.buyNowPrice,
          type: l.type,
          category: l.category,
          condition: l.condition,
          location: l.location,
          images: (l as unknown as { images?: unknown[] | null }).images ?? null,
          status: (l as unknown as { status?: string | null }).status ?? "ACTIVE",
          endsAt: (l as unknown as { endsAt?: string | Date | null }).endsAt ?? null,
          offerCount: l._count?.offers ?? 0,
          currentOffer: currentOffer,
          createdAt: l.createdAt,
          seller: {
            name: l.seller?.name || l.seller?.username || null,
            memberSince: l.seller?.createdAt ?? null,
            location: l.seller?.location ?? null,
            emailVerified: l.seller?.emailVerified ?? false,
            phone: l.seller?.phone ?? null,
          },
        }}
        initiallyWatched={watchedSet.has(l.id)}
        viewerAuthed={!!userId}
        showWatchButton={true}
      />
    );
  }


  function listingImageSrc(l: (typeof listings)[number] | null | undefined) {
    const imgs = Array.isArray(l?.images) ? l?.images : [];
    const first = imgs && imgs.length ? imgs[0] : null;
    if (!first) return "";
    if (typeof first === "string") return first;
    if (typeof first === "object" && first && "url" in first && typeof (first as { url?: unknown }).url === "string") return String((first as { url: string }).url);
    if (typeof first === "object" && first && "src" in first && typeof (first as { src?: unknown }).src === "string") return String((first as { src: string }).src);
    return "";
  }

  function listingDisplayPrice(l: (typeof listings)[number] | null | undefined) {
    if (!l) return "";
    const currentOffer = l.offers && l.offers.length ? l.offers[0].amount : null;
    const price = l.type === "OFFERABLE" ? (currentOffer ?? l.price) : (l.buyNowPrice ?? l.price);
    return (Number(price || 0) / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
  }

  function findVisualListing(categoryNeedles: string[], titleNeedles: string[]) {
    const pool = listings.filter(function (l) { return !!listingImageSrc(l); });
    const byTitle = pool.find(function (l) {
      const haystack = (String(l.title || "") + " " + String(l.category || "")).toLowerCase();
      return titleNeedles.some(function (needle) { return haystack.indexOf(needle) >= 0; });
    });
    if (byTitle) return byTitle;
    const byCategory = pool.find(function (l) {
      const haystack = String(l.category || "").toLowerCase();
      return categoryNeedles.some(function (needle) { return haystack.indexOf(needle) >= 0; });
    });
    return byCategory || null;
  }

  const heroVisuals = [
    { key: "sofa", label: "Sofa", fallbackTitle: "2 Seater Sofa", fallbackPrice: "$180", listing: findVisualListing(["home", "living", "furniture"], ["sofa", "couch", "chair"]) },
    { key: "bicycle", label: "Bicycle", fallbackTitle: "Giant Escape 3", fallbackPrice: "$320", listing: findVisualListing(["sport", "outdoor", "vehicle"], ["bike", "bicycle", "giant"]) },
    { key: "headphones", label: "Headphones", fallbackTitle: "Wireless Headphones", fallbackPrice: "$85", listing: findVisualListing(["electronics"], ["headphone", "airpods", "sony", "audio"]) },
    { key: "camera", label: "Camera", fallbackTitle: "Canon EOS Camera", fallbackPrice: "$450", listing: findVisualListing(["electronics"], ["camera", "canon", "nikon", "lens"]) },
  ];

  const preferredCategoryLabels = ["Electronics", "Home & Furniture", "Vehicles", "Sports & Outdoors", "Fashion", "Baby & Kids"];
  const validCategoryParents = new Set(CATEGORY_GROUPS.map((group) => group.parent));
  const fixedCategories = preferredCategoryLabels
    .filter((label) => validCategoryParents.has(label))
    .map((label) => ({
      label,
      icon: label === "Electronics" ? "phone" : label === "Home & Furniture" ? "home" : label === "Vehicles" ? "car" : label === "Sports & Outdoors" ? "ball" : label === "Fashion" ? "shirt" : "baby",
      href: "/listings?category=" + encodeURIComponent(label),
      count: topLevelCategoryCounts.get(label) || 0,
    }))
    .concat([{ label: "More", icon: "grid", href: "/listings", count: 0 }]);

  function LineIcon({ name }: { name: string }) {
    const cls = "h-6 w-6";
    if (name === "phone") return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="8" y="3" width="8" height="18" rx="2" /><path d="M11 18h2" /></svg>;
    if (name === "home") return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 11 12 5l8 6" /><path d="M6 10.5V20h12v-9.5" /><path d="M10 20v-5h4v5" /></svg>;
    if (name === "car") return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 12 2-5h10l2 5" /><rect x="4" y="12" width="16" height="6" rx="2" /><path d="M7 18v2M17 18v2M7 15h.01M17 15h.01" /></svg>;
    if (name === "ball") return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><path d="M5.5 10h13M8 5.5c2.2 3.8 2.2 9.2 0 13M16 5.5c-2.2 3.8-2.2 9.2 0 13" /></svg>;
    if (name === "shirt") return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 4 5 6.5 3 10l4 2v8h10v-8l4-2-2-3.5L16 4a5 5 0 0 1-8 0Z" /></svg>;
    if (name === "baby") return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3" /><path d="M6 21a6 6 0 0 1 12 0M9 14l-3 3M15 14l3 3" /></svg>;
    if (name === "shield") return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6l-7-3Z" /></svg>;
    if (name === "pin") return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    if (name === "lock") return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
    if (name === "star") return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z" /></svg>;
    return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></svg>;
  }

  function ProductPlaceholder({ type }: { type: string }) {
    if (type === "sofa") {
      return <div className="flex h-full items-end justify-center bg-[linear-gradient(135deg,#EEF4FF,#F8FAFF)] p-4"><div className="relative h-20 w-36"><div className="absolute bottom-0 h-12 w-full rounded-2xl bg-[#A9B4C6]" /><div className="absolute bottom-9 left-2 h-10 w-14 rounded-2xl bg-[#C7CFDA]" /><div className="absolute bottom-9 right-2 h-10 w-14 rounded-2xl bg-[#C7CFDA]" /><div className="absolute bottom-0 left-4 h-4 w-2 bg-[#65748A]" /><div className="absolute bottom-0 right-4 h-4 w-2 bg-[#65748A]" /></div></div>;
    }
    if (type === "bicycle") {
      return <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#F3F7FF,#E8F0FF)]"><svg className="h-28 w-40 text-[#1B2942]" viewBox="0 0 180 120" fill="none" stroke="currentColor" strokeWidth="7"><circle cx="48" cy="82" r="24" /><circle cx="132" cy="82" r="24" /><path d="M48 82 75 48h32l25 34M75 48l20 34H48M95 82l12-34M105 48h18M72 39h20" /></svg></div>;
    }
    if (type === "headphones") {
      return <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#F8FAFF,#EAF1FF)]"><div className="relative h-28 w-28 rounded-full border-[10px] border-[#D6DEEA]"><div className="absolute -bottom-2 left-0 h-16 w-9 rounded-2xl bg-[#10213F]" /><div className="absolute -bottom-2 right-0 h-16 w-9 rounded-2xl bg-[#10213F]" /></div></div>;
    }
    return <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#F8FAFF,#EAF1FF)]"><div className="relative h-20 w-32 rounded-[22px] bg-[#1C2A44]"><div className="absolute left-5 top-[-14px] h-6 w-16 rounded-t-2xl bg-[#44546D]" /><div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-[7px] border-[#7E8CA3] bg-[#B8C3D3]" /><div className="absolute right-4 top-4 h-3 w-3 rounded-full bg-[#DDE6F3]" /></div></div>;
  }

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        suppressHydrationWarning={true}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceJsonLd) }}
      />
      <div className="bd-shell flex flex-col gap-7 py-5 sm:py-7 lg:gap-8 lg:py-8">
        <section className="relative overflow-hidden rounded-[30px] border border-[#D7E2F1] bg-[#F1F6FF] shadow-[0_22px_70px_rgba(28,50,84,0.10)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_320px_at_78%_18%,rgba(11,77,255,0.12),transparent_70%)]" />
          <div className="pointer-events-none absolute -bottom-28 right-0 h-72 w-[68%] rounded-tl-[999px] bg-[#E5EFFD]" />
          <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,0.95fr)_minmax(25rem,0.9fr)] lg:items-center lg:p-10">
            <div>
              <div className="bd-pill w-fit border-blue-100 bg-white/75 text-[#0B4DFF] shadow-sm">Australia&apos;s local marketplace</div>
              <h1 className="mt-5 max-w-2xl text-[2.35rem] font-black leading-[1.03] tracking-[-0.055em] text-[#06132B] sm:text-5xl lg:text-[4.35rem]">
                Buy, sell and discover amazing local deals.
              </h1>
              <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-[#526173] sm:text-lg">
                Buy now. Make offers. Arrange handover.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/listings" className="bd-primary-action rounded-2xl px-6">Browse listings</Link>
                <Link href={userId ? "/sell/new" : "/auth/register"} className="bd-btn bd-btn-secondary rounded-2xl border-[#0B4DFF] px-6 py-3 text-[#0B4DFF]">Sell an item</Link>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ["shield", "Safe and trusted", "A secure community built on trust."],
                  ["pin", "Local and convenient", "Buy and sell with people in your area."],
                  ["star", "Great deals", "Find value or make offers that work for you."],
                ].map((item) => (
                  <div key={item[1]} className="flex gap-3 rounded-[18px] bg-white/55 p-3.5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white text-[#0B4DFF] shadow-sm"><LineIcon name={item[0]} /></div>
                    <div>
                      <div className="text-sm font-black text-[#06132B]">{item[1]}</div>
                      <p className="mt-1 text-xs leading-5 text-[#607089]">{item[2]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {heroVisuals.map((item, index) => {
                const src = listingImageSrc(item.listing);
                const href = item.listing ? "/listings/" + item.listing.id : "/listings";
                const title = item.listing?.title || item.fallbackTitle;
                const price = listingDisplayPrice(item.listing) || item.fallbackPrice;
                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={(index === 0 ? "mt-8 " : index === 3 ? "-mt-8 " : "") + "group relative overflow-hidden rounded-[24px] border border-white bg-white p-2 shadow-[0_24px_70px_rgba(28,50,84,0.18)] transition hover:-translate-y-1"}
                  >
                    <div className="relative aspect-[1.22/1] overflow-hidden rounded-[20px] bg-[#EEF4FF]">
                      {src ? <Image src={src} alt={title} fill className="object-cover transition duration-300 group-hover:scale-[1.03]" sizes="(max-width: 768px) 42vw, 21vw" /> : <ProductPlaceholder type={item.key} />}
                      <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-black text-[#06132B] shadow-sm">{price}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#06132B]">Browse categories</h2>
            </div>
            <Link href="/listings" className="text-sm font-extrabold text-[#0B4DFF]">View all categories</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0">
            {fixedCategories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="min-w-[8.5rem] rounded-[20px] border border-[#D7E2F1] bg-white p-4 text-center shadow-[0_12px_35px_rgba(28,50,84,0.06)] transition hover:-translate-y-0.5 hover:border-[#B9CAE2] hover:shadow-[0_18px_45px_rgba(28,50,84,0.10)]"
              >
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-[#F3F7FF] text-[#06132B]"><LineIcon name={cat.icon} /></div>
                <div className="mt-3 truncate text-sm font-black text-[#06132B]">{cat.label}</div>
                <div className="mt-1 text-xs font-semibold text-[#607089]">{cat.count > 0 ? cat.count.toLocaleString() + " items" : (cat.label === "More" ? "View listings" : "Explore")}</div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#06132B]">Latest listings</h2>
            </div>
            <Link href="/listings" className="text-sm font-extrabold text-[#0B4DFF]">View all listings</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {latestListings.length ? latestListings.slice(0, 5).map(renderCard) : (
              <div className="col-span-full rounded-[24px] border border-dashed border-[#BFD0E6] bg-[#F8FAFF] px-5 py-10 text-center">
                <div className="text-lg font-extrabold text-[#0F172A]">No listings yet</div>
                <p className="mt-2 text-sm text-[#607089]">Create a listing with clear photos, condition, price, and location details.</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Link href={userId ? "/sell/new" : "/auth/register"} className="bd-btn bd-btn-primary">Create a listing</Link>
                  <Link href="/listings" className="bd-btn bd-btn-secondary">Browse listings</Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[26px] bg-[#06132B] p-4 text-white shadow-[0_24px_70px_rgba(7,21,46,0.22)] sm:p-6 lg:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1fr_auto] lg:items-center">
            <div className="relative min-h-32 overflow-hidden rounded-[24px] bg-white p-4 text-[#06132B]">
              <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-[#EAF1FF]" />
              <div className="relative mx-auto w-28 rounded-[26px] border-[7px] border-[#06132B] bg-[#F8FAFF] p-3 shadow-xl">
                <div className="mb-3 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#0B4DFF]" /><span className="h-2 w-8 rounded-full bg-[#D7E2F1]" /></div>
                <div className="rounded-2xl bg-[#EEF4FF] p-3 text-center text-xs font-black">bidra</div>
                <div className="mt-2 grid grid-cols-2 gap-1"><span className="h-8 rounded-lg bg-[#D7E2F1]" /><span className="h-8 rounded-lg bg-[#CBD9EF]" /></div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">The smarter way to buy and sell locally.</h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-blue-100">Join thousands of Australians using Bidra every day.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <span className="inline-flex min-h-11 items-center rounded-xl border border-white/15 bg-black/35 px-4 text-xs font-black text-white">App Store</span>
              <span className="inline-flex min-h-11 items-center rounded-xl border border-white/15 bg-black/35 px-4 text-xs font-black text-white">Google Play</span>
            </div>
          </div>
        </section>

        <section className="rounded-[26px] border border-[#D7E2F1] bg-white p-5 shadow-[0_14px_45px_rgba(28,50,84,0.06)] sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["phone", "Find what you love", "Browse local categories and image-first listings."],
              ["star", "Buy now or make an offer", "Choose the path that fits the item and seller."],
              ["pin", "Arrange handover", "Keep details in messages and meet, post or hand over directly."],
            ].map((step) => (
              <div key={step[1]} className="flex gap-4 rounded-[22px] bg-[#F8FAFF] p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#0B4DFF] shadow-sm"><LineIcon name={step[0]} /></div>
                <div>
                  <div className="text-base font-black text-[#06132B]">{step[1]}</div>
                  <p className="mt-1 text-sm leading-6 text-[#607089]">{step[2]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-[#D7E2F1] bg-[#F3F7FF] p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-4">
            {[["star", "100% Free"], ["pin", "Local"], ["lock", "Secure"], ["shield", "Trusted"]].map((item) => (
              <div key={item[1]} className="flex items-center justify-center gap-3 rounded-[20px] bg-white px-5 py-4 text-sm font-black text-[#06132B] shadow-sm">
                <span className="text-[#0B4DFF]"><LineIcon name={item[0]} /></span>
                <span>{item[1]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
