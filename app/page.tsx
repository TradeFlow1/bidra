import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listing-card";
import { CategoryTile, SectionHeader, TrustBadge } from "@/components/marketplace-ui";

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
  const featuredCategories = Array.from(topLevelCategoryCounts.entries())
    .sort(function (a, b) { return b[1] - a[1]; })
    .slice(0, 6);

  const latestListings = listings.slice(0, 12);
  const usedListingIds = new Set(latestListings.map(function (l) { return l.id; }));
  const offerableListings = listings
    .filter(function (l) { return l.type === "OFFERABLE" && !usedListingIds.has(l.id); })
    .slice(0, 4);
  for (let i = 0; i < offerableListings.length; i += 1) usedListingIds.add(offerableListings[i].id);
  const buyNowListings = listings
    .filter(function (l) { return l.type !== "OFFERABLE" && !usedListingIds.has(l.id); })
    .slice(0, 4);

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

  return (
    <main className="bg-[#F4F7FB]">
      <script
        type="application/ld+json"
        suppressHydrationWarning={true}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceJsonLd) }}
      />
      <div className="bd-shell flex flex-col gap-6 py-5 sm:py-7 lg:py-8">
        <section className="bd-page-hero">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(25rem,0.95fr)] lg:items-center lg:p-8">
            <div>
              <div className="bd-pill w-fit border-blue-100 bg-[#EEF4FF] text-[#0B4DFF]">Australia&apos;s local marketplace</div>
              <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-[-0.045em] text-[#07152E] sm:text-5xl lg:text-6xl">
                Buy, sell and discover amazing local deals.
              </h1>
              <p className="mt-4 max-w-xl text-base font-medium leading-7 text-[#526173] sm:text-lg">
                Buy now. Make offers. Arrange handover.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/listings" className="bd-primary-action">Browse listings</Link>
                <Link href={userId ? "/sell/new" : "/auth/register"} className="bd-btn bd-btn-secondary rounded-2xl px-5 py-3">Sell an item</Link>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <TrustBadge title="Safe and trusted" description="Accounts and records help support confident buying." icon="◇" />
                <TrustBadge title="Local and convenient" description="Find pickup, postage, and handover options nearby." icon="⌖" />
                <TrustBadge title="Great deals" description="Buy now or make offers that work for you." icon="$" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {(latestListings.length ? latestListings.slice(0, 4) : listings.slice(0, 4)).map((listing, index) => {
                const imgs = Array.isArray(listing.images) ? listing.images : [];
                const src = (imgs[0] as any)?.url || (imgs[0] as any)?.src || imgs[0] || "/brand/hero-clouds.png";
                const price = listing.type === "OFFERABLE" ? (listing.offers?.[0]?.amount ?? listing.price) : (listing.buyNowPrice ?? listing.price);
                return (
                  <Link key={listing.id} href={"/listings/" + listing.id} className={(index === 0 ? "mt-8 " : index === 3 ? "-mt-8 " : "") + "group overflow-hidden rounded-[22px] border border-white bg-white p-2 shadow-[0_20px_55px_rgba(28,50,84,0.16)] transition hover:-translate-y-1"}>
                    <div className="relative aspect-[1.25/1] overflow-hidden rounded-[18px] bg-[#EEF3FA]">
                      <Image src={src} alt={listing.title} fill className="object-cover transition group-hover:scale-[1.03]" sizes="(max-width: 1024px) 45vw, 22vw" />
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-black text-[#07152E]">{(Number(price || 0) / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" })}</div>
                      <div className="mt-1 truncate text-xs font-bold text-[#526173]">{listing.title}</div>
                    </div>
                  </Link>
                );
              })}
              {latestListings.length === 0 ? (
                <div className="col-span-2 rounded-[24px] border border-dashed border-[#BFD0E6] bg-white/80 p-8 text-center">
                  <div className="text-lg font-extrabold text-[#0F172A]">Local finds will appear here</div>
                  <p className="mt-2 text-sm text-[#607089]">Be one of the first sellers to list on Bidra.</p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="bd-card p-4 sm:p-5 lg:p-6">
          <SectionHeader eyebrow="Browse categories" title="Shop by category" actionHref="/listings" actionLabel="View all" />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(featuredCategories.length ? featuredCategories : [["Electronics", 0], ["Home & Living", 0], ["Vehicles", 0], ["Sports & Outdoors", 0], ["Fashion", 0], ["More", 0]] as Array<[string, number]>).map((entry) => (
              <CategoryTile key={entry[0]} href={entry[0] === "More" ? "/listings" : "/listings?category=" + encodeURIComponent(entry[0])} label={entry[0]} count={entry[1]} icon={entry[0] === "Electronics" ? "▯" : entry[0] === "Vehicles" ? "▱" : entry[0] === "Fashion" ? "◇" : "□"} />
            ))}
          </div>
        </section>

        <section className="bd-card p-4 sm:p-5 lg:p-6">
          <SectionHeader eyebrow="Latest listings" title="Fresh finds near you" actionHref="/listings" actionLabel="View all" />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {latestListings.length ? latestListings.slice(0, 10).map(renderCard) : (
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

        <section className="overflow-hidden rounded-[28px] bg-[#07152E] p-5 text-white shadow-[0_20px_60px_rgba(7,21,46,0.18)] sm:p-7 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-200">Bidra local marketplace</div>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">The smarter way to buy and sell locally.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">Search image-first listings, choose Buy now or make an offer, then arrange pickup, payment and handover directly with the other person.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href="/listings" className="bd-btn rounded-2xl border-white bg-white text-[#07152E] hover:bg-blue-50">Browse marketplace</Link>
                <Link href={userId ? "/sell/new" : "/auth/register"} className="bd-btn rounded-2xl border-white/25 bg-white/10 text-white hover:bg-white/15">Start selling</Link>
              </div>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/8 p-4">
              <div className="rounded-[22px] bg-white p-4 text-[#07152E] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#E6EDF7] pb-3 text-xs font-extrabold"><span>Today on Bidra</span><span className="text-[#0B4DFF]">Local deals</span></div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#EEF4FF] p-4"><div className="text-2xl font-black">Buy</div><p className="mt-1 text-xs text-[#526173]">Secure a listing at the listed price.</p></div>
                  <div className="rounded-2xl bg-[#F8FAFF] p-4"><div className="text-2xl font-black">Offer</div><p className="mt-1 text-xs text-[#526173]">Negotiate with confidence.</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bd-card p-4 sm:p-5 lg:p-6">
          <SectionHeader eyebrow="How it works" title="Simple from discovery to handover" />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ["1", "Find what you love", "Browse local categories and image-first listings."],
              ["2", "Buy now or make an offer", "Choose the path that fits the item and seller."],
              ["3", "Arrange handover", "Keep details in messages and meet, post or hand over directly."],
            ].map((step) => (
              <div key={step[0]} className="rounded-[22px] border border-[#D7E2F1] bg-[#F8FAFF] p-5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0B4DFF] text-sm font-black text-white">{step[0]}</div>
                <div className="mt-4 text-lg font-black text-[#07152E]">{step[1]}</div>
                <p className="mt-2 text-sm leading-6 text-[#526173]">{step[2]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-4">
          {["100% Free", "Local", "Secure", "Trusted"].map((label) => (
            <div key={label} className="rounded-[20px] border border-[#D7E2F1] bg-white px-5 py-4 text-center text-sm font-black text-[#07152E] shadow-sm">{label}</div>
          ))}
        </section>
      </div>
    </main>
  );
}
