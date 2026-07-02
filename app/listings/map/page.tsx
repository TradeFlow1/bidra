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
    if (where.AND.length === 0)
        delete where.AND;
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
    return (<ReferencePage>
      <div>
        <BackButton href="/listings" label="Back to listings"/>
        <section>
          <div>Map/list browsing</div>
          <h1>Browse listings by area</h1>
          <p>Use the map and list together to compare nearby active listings. Bidra shows marketplace listings only; payment, pickup, delivery or postage is arranged directly in Messages.</p>
          <div><Link href="/listings">Standard list</Link><Link href="/sell/new">Create listing</Link></div>
        </section>

        <section>
          <form action="/listings/map">
            <input name="q" defaultValue={selectedQuery} placeholder="Search keyword"/>
            <select name="category" defaultValue={selectedCategory}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <div>
              <input name="location" defaultValue={selectedLocation} placeholder="Suburb"/>
              <input name="state" defaultValue={selectedState} placeholder="State"/>
            </div>
            <button>Update map</button>
          </form>
        </section>

        <div>
          <div><div>Results</div><div>{listings.length}</div></div>
          <div><div>Mapped</div><div>{mappedCount}</div></div>
          <div><div>Source</div><div>Seller-provided listing location fields</div></div>
        </div>

        <div><ListingsMapPanel listings={listings}/></div>
      </div>
    </ReferencePage>);
}
