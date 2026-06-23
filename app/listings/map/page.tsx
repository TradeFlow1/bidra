import Link from "next/link";
import ListingsMapPanel from "@/components/listings-map-panel";
import { BackButton } from "@/components/ui/back-button";
import { ReferencePage, appShell } from "@/components/marketplace-redesign";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams?: {
    q?: string;
    category?: string;
    location?: string;
    state?: string;
  };
};

const categories = [
  "Electronics",
  "Home & Living",
  "Vehicles",
  "Machinery & Equipment",
  "Sports & Outdoors",
  "Fashion",
  "Kids & Baby",
  "Books & Media",
  "Other",
];

function clean(value?: string) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 80);
}

function slugToCategory(value: string) {
  const normalized = value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return categories.find((category) => category.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === normalized) || value;
}

export default async function ListingsMapPage({ searchParams = {} }: Props) {
  const selectedQuery = clean(searchParams.q);
  const selectedCategory = clean(searchParams.category);
  const selectedLocation = clean(searchParams.location);
  const selectedState = clean(searchParams.state).toUpperCase();
  const categoryLabel = selectedCategory ? slugToCategory(selectedCategory) : "";

  const where: any = {
    status: "ACTIVE",
    orders: { none: {} },
    NOT: [
      { title: { equals: "test", mode: "insensitive" } },
      { title: { startsWith: "test", mode: "insensitive" } },
      { title: { contains: "dfgh", mode: "insensitive" } },
      { title: { contains: "asdf", mode: "insensitive" } },
      { title: { contains: "qwer", mode: "insensitive" } },
      { title: { contains: "no photos", mode: "insensitive" } },
      { title: { contains: "no photo", mode: "insensitive" } },
    ],
    AND: [],
  };

  if (categoryLabel) {
    where.AND.push({ OR: [{ category: { equals: categoryLabel, mode: "insensitive" } }, { category: { startsWith: categoryLabel + " > ", mode: "insensitive" } }] });
  }

  if (selectedQuery) {
    where.AND.push({
      OR: [
        { title: { contains: selectedQuery, mode: "insensitive" } },
        { description: { contains: selectedQuery, mode: "insensitive" } },
        { category: { contains: selectedQuery, mode: "insensitive" } },
        { location: { contains: selectedQuery, mode: "insensitive" } },
      ],
    });
  }

  if (selectedLocation || selectedState) {
    const locationParts = [selectedLocation, selectedState].filter(Boolean);
    where.AND.push({
      OR: locationParts.flatMap((part) => [
        { location: { contains: part, mode: "insensitive" } },
        { locationSuburb: { contains: part, mode: "insensitive" } },
        { locationState: { contains: part, mode: "insensitive" } },
        { locationPostcode: { contains: part, mode: "insensitive" } },
      ]),
    });
  }

  if (where.AND.length === 0) delete where.AND;

  const listings = await prisma.listing.findMany({
    where,
    orderBy: [{ latitude: "desc" }, { updatedAt: "desc" }, { createdAt: "desc" }],
    take: 80,
    select: {
      id: true,
      title: true,
      category: true,
      location: true,
      latitude: true,
      longitude: true,
      price: true,
      buyNowPrice: true,
      type: true,
      createdAt: true,
    },
  });

  const mappedCount = listings.filter((listing) => typeof listing.latitude === "number" && typeof listing.longitude === "number").length;

  return (
    <ReferencePage>
      <div className={appShell + " py-5 sm:py-7"}>
        <BackButton href="/listings" label="Back to listings" />
        <section className="mt-4 rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0B4DFF]">Map/list browsing</div>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">Browse listings by area</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#36506F] sm:text-base">Use the map and list together to compare nearby active listings. Bidra shows marketplace listings only; payment, pickup, delivery or postage is arranged directly in Messages.</p>
          <div className="mt-5 flex flex-wrap gap-2"><Link href="/listings" className="bd-btn bd-btn-secondary text-center">Standard list</Link><Link href="/sell/new" className="bd-btn bd-btn-primary text-center">Create listing</Link></div>
        </section>

        <section className="mt-5 rounded-[28px] border border-[#D8E6F8] bg-white p-4 shadow-sm">
          <form action="/listings/map" className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_140px]">
            <input name="q" defaultValue={selectedQuery} className="h-11 rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Search keyword" />
            <select name="category" defaultValue={selectedCategory} className="h-11 rounded-2xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold">
              <option value="">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input name="location" defaultValue={selectedLocation} className="h-11 rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Suburb" />
              <input name="state" defaultValue={selectedState} className="h-11 rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold uppercase" placeholder="State" />
            </div>
            <button className="h-11 rounded-2xl bg-[#4F46E5] px-5 text-sm font-black text-white">Update map</button>
          </form>
        </section>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-[#D8E6F8] bg-white p-4 shadow-sm"><div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#64748B]">Results</div><div className="mt-1 text-3xl font-black text-[#07152E]">{listings.length}</div></div>
          <div className="rounded-[24px] border border-[#D8E6F8] bg-white p-4 shadow-sm"><div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#64748B]">Mapped</div><div className="mt-1 text-3xl font-black text-[#07152E]">{mappedCount}</div></div>
          <div className="rounded-[24px] border border-[#D8E6F8] bg-white p-4 shadow-sm"><div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#64748B]">Source</div><div className="mt-1 text-sm font-black leading-6 text-[#526173]">Seller-provided listing location fields</div></div>
        </div>

        <div className="mt-5"><ListingsMapPanel listings={listings} /></div>
      </div>
    </ReferencePage>
  );
}
