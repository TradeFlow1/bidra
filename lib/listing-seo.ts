import { Prisma } from "@prisma/client";
import { BIDRA_CATEGORIES } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/base-url";

export const SEO_LOCATIONS: Array<{ slug: string; label: string }> = [
  { slug: "brisbane", label: "Brisbane" },
  { slug: "gold-coast", label: "Gold Coast" },
  { slug: "sydney", label: "Sydney" },
  { slug: "melbourne", label: "Melbourne" },
  { slug: "perth", label: "Perth" },
  { slug: "adelaide", label: "Adelaide" },
  { slug: "canberra", label: "Canberra" },
  { slug: "hobart", label: "Hobart" },
  { slug: "darwin", label: "Darwin" },
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
    and.push({
      location: { contains: locationLabel, mode: "insensitive" },
    });
  }

  return { AND: and };
}

export async function getSeoListings(categoryLabel: string, locationLabel?: string) {
  return prisma.listing.findMany({
    where: getActiveListingWhere(categoryLabel, locationLabel),
    orderBy: { createdAt: "desc" },
    take: 50,
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
    },
  });
}

export async function getSeoCategoryLocationLinks(categoryLabel: string) {
  const rows = await prisma.listing.findMany({
    where: getActiveListingWhere(categoryLabel),
    select: { location: true },
    distinct: ["location"],
    take: 500,
  });

  const available: Array<{ slug: string; label: string }> = [];

  for (let i = 0; i < SEO_LOCATIONS.length; i += 1) {
    const option = SEO_LOCATIONS[i];
    for (let j = 0; j < rows.length; j += 1) {
      const value = String(rows[j].location || "");
      if (value.toLowerCase().includes(option.label.toLowerCase())) {
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
        const rowLocation = String(row.location || "").toLowerCase();
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
