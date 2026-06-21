import { Prisma } from "@prisma/client";
import { BIDRA_CATEGORIES } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/base-url";

type SeoLocation = { slug: string; label: string; state?: string; kind?: "city" | "suburb" };

export const SEO_LOCATIONS: SeoLocation[] = [
  { slug: "brisbane", label: "Brisbane", state: "QLD", kind: "city" },
  { slug: "gold-coast", label: "Gold Coast", state: "QLD", kind: "city" },
  { slug: "sydney", label: "Sydney", state: "NSW", kind: "city" },
  { slug: "melbourne", label: "Melbourne", state: "VIC", kind: "city" },
  { slug: "perth", label: "Perth", state: "WA", kind: "city" },
  { slug: "adelaide", label: "Adelaide", state: "SA", kind: "city" },
  { slug: "canberra", label: "Canberra", state: "ACT", kind: "city" },
  { slug: "hobart", label: "Hobart", state: "TAS", kind: "city" },
  { slug: "darwin", label: "Darwin", state: "NT", kind: "city" },
  { slug: "brisbane-city", label: "Brisbane City", state: "QLD", kind: "suburb" },
  { slug: "south-brisbane", label: "South Brisbane", state: "QLD", kind: "suburb" },
  { slug: "fortitude-valley", label: "Fortitude Valley", state: "QLD", kind: "suburb" },
  { slug: "new-farm", label: "New Farm", state: "QLD", kind: "suburb" },
  { slug: "surfers-paradise", label: "Surfers Paradise", state: "QLD", kind: "suburb" },
  { slug: "southport", label: "Southport", state: "QLD", kind: "suburb" },
  { slug: "parramatta", label: "Parramatta", state: "NSW", kind: "suburb" },
  { slug: "surry-hills", label: "Surry Hills", state: "NSW", kind: "suburb" },
  { slug: "bondi", label: "Bondi", state: "NSW", kind: "suburb" },
  { slug: "richmond-vic", label: "Richmond", state: "VIC", kind: "suburb" },
  { slug: "fitzroy", label: "Fitzroy", state: "VIC", kind: "suburb" },
  { slug: "st-kilda", label: "St Kilda", state: "VIC", kind: "suburb" },
  { slug: "fremantle", label: "Fremantle", state: "WA", kind: "suburb" },
  { slug: "northbridge", label: "Northbridge", state: "WA", kind: "suburb" },
  { slug: "glenelg", label: "Glenelg", state: "SA", kind: "suburb" },
  { slug: "braddon", label: "Braddon", state: "ACT", kind: "suburb" },
];

export const SEO_CATEGORY_OPTIONS = BIDRA_CATEGORIES.map(function (category) {
  return { slug: category.key, label: category.label };
});

export function getSeoCategoryBySlug(slug: string) {
  for (let i = 0; i < SEO_CATEGORY_OPTIONS.length; i += 1) {
    if (SEO_CATEGORY_OPTIONS[i].slug === slug) return SEO_CATEGORY_OPTIONS[i];
  }
  return null;
}

export function getSeoLocationBySlug(slug: string) {
  for (let i = 0; i < SEO_LOCATIONS.length; i += 1) {
    if (SEO_LOCATIONS[i].slug === slug) return SEO_LOCATIONS[i];
  }
  return null;
}

export function getSiteUrl() {
  return getBaseUrl().replace(/\/+$/, "");
}

function getLocationWhere(locationLabel: string): Prisma.ListingWhereInput {
  return {
    OR: [
      { location: { contains: locationLabel, mode: "insensitive" } },
      { locationSuburb: { contains: locationLabel, mode: "insensitive" } },
      { locationState: { contains: locationLabel, mode: "insensitive" } },
      { locationPostcode: { contains: locationLabel, mode: "insensitive" } },
    ],
  };
}

function getActiveListingWhere(categoryLabel: string, locationLabel?: string): Prisma.ListingWhereInput {
  const and: Prisma.ListingWhereInput[] = [
    { status: "ACTIVE" },
    { orders: { none: {} } },
    {
      OR: [
        { category: categoryLabel },
        { category: { startsWith: categoryLabel + " > " } },
      ],
    },
  ];

  if (locationLabel) {
    and.push(getLocationWhere(locationLabel));
  }

  return { AND: and };
}

function getActiveLocationListingWhere(locationLabel: string): Prisma.ListingWhereInput {
  return {
    AND: [
      { status: "ACTIVE" },
      { orders: { none: {} } },
      getLocationWhere(locationLabel),
    ],
  };
}

const listingSelect = {
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
  currentOfferAmount: true,
  images: true,
  offers: {
    orderBy: { amount: "desc" },
    take: 1,
    select: { amount: true },
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
  _count: {
    select: { offers: true },
  },
} satisfies Prisma.ListingSelect;

export async function getSeoListings(categoryLabel: string, locationLabel?: string) {
  return prisma.listing.findMany({
    where: getActiveListingWhere(categoryLabel, locationLabel),
    orderBy: { createdAt: "desc" },
    take: 50,
    select: listingSelect,
  });
}

export async function getSeoLocationListings(locationLabel: string) {
  return prisma.listing.findMany({
    where: getActiveLocationListingWhere(locationLabel),
    orderBy: { createdAt: "desc" },
    take: 50,
    select: listingSelect,
  });
}

export async function getSeoCategoryLocationLinks(categoryLabel: string) {
  const rows = await prisma.listing.findMany({
    where: getActiveListingWhere(categoryLabel),
    select: { location: true, locationSuburb: true, locationState: true, locationPostcode: true },
    distinct: ["location"],
    take: 500,
  });

  const available: SeoLocation[] = [];

  for (let i = 0; i < SEO_LOCATIONS.length; i += 1) {
    const option = SEO_LOCATIONS[i];
    for (let j = 0; j < rows.length; j += 1) {
      const haystack = [rows[j].location, rows[j].locationSuburb, rows[j].locationState, rows[j].locationPostcode].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(option.label.toLowerCase())) {
        available.push(option);
        break;
      }
    }
  }

  return available;
}

export async function getSeoLocationLandingLinks() {
  const rows = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      orders: { none: {} },
    },
    select: { location: true, locationSuburb: true, locationState: true, locationPostcode: true },
    take: 1000,
  });

  const available: SeoLocation[] = [];

  for (let i = 0; i < SEO_LOCATIONS.length; i += 1) {
    const option = SEO_LOCATIONS[i];
    for (let j = 0; j < rows.length; j += 1) {
      const haystack = [rows[j].location, rows[j].locationSuburb, rows[j].locationState, rows[j].locationPostcode].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(option.label.toLowerCase())) {
        available.push(option);
        break;
      }
    }
  }

  return available;
}

export async function getSeoSitemapCombos() {
  const rows = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      orders: { none: {} },
    },
    select: {
      category: true,
      location: true,
      locationSuburb: true,
      locationState: true,
      locationPostcode: true,
    },
    take: 1000,
  });

  const entries: Array<{ categorySlug: string; locationSlug?: string }> = [];

  for (let i = 0; i < SEO_CATEGORY_OPTIONS.length; i += 1) {
    const category = SEO_CATEGORY_OPTIONS[i];
    let hasCategory = false;
    const categoryLocations = new Set<string>();

    for (let j = 0; j < rows.length; j += 1) {
      const row = rows[j];
      const matchesCategory =
        row.category === category.label ||
        row.category.startsWith(category.label + " > ");
      if (!matchesCategory) continue;
      hasCategory = true;

      for (let k = 0; k < SEO_LOCATIONS.length; k += 1) {
        const location = SEO_LOCATIONS[k];
        const rowLocation = [row.location, row.locationSuburb, row.locationState, row.locationPostcode].filter(Boolean).join(" ").toLowerCase();
        if (rowLocation.includes(location.label.toLowerCase())) {
          categoryLocations.add(location.slug);
        }
      }
    }

    if (!hasCategory) continue;
    entries.push({ categorySlug: category.slug });

    for (let j = 0; j < SEO_LOCATIONS.length; j += 1) {
      const location = SEO_LOCATIONS[j];
      if (!categoryLocations.has(location.slug)) continue;
      entries.push({ categorySlug: category.slug, locationSlug: location.slug });
    }
  }

  return entries;
}
