import type { MetadataRoute } from "next";
import { getSeoSitemapCombos, getSiteUrl } from "@/lib/listing-seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/listings`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/how-it-works`, lastModified: now, changeFrequency: "weekly", priority: 0.72 },
    { url: `${baseUrl}/help`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/support`, lastModified: now, changeFrequency: "weekly", priority: 0.68 },
    { url: `${baseUrl}/legal`, lastModified: now, changeFrequency: "monthly", priority: 0.55 },
    { url: `${baseUrl}/legal/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/legal/fees`, lastModified: now, changeFrequency: "monthly", priority: 0.48 },
    { url: `${baseUrl}/legal/prohibited-items`, lastModified: now, changeFrequency: "monthly", priority: 0.48 },
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
