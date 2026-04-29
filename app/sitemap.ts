import type { MetadataRoute } from "next";
import { getSeoSitemapCombos, getSiteUrl } from "@/lib/listing-seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/listings`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  const combos = process.env.DATABASE_URL ? await getSeoSitemapCombos() : [];

  const seoEntries: MetadataRoute.Sitemap = combos.map(function (combo) {
    const path = combo.locationSlug
      ? `/listings/c/${combo.categorySlug}/${combo.locationSlug}`
      : `/listings/c/${combo.categorySlug}`;

    return {
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: combo.locationSlug ? 0.75 : 0.8,
    };
  });

  return staticEntries.concat(seoEntries);
}
