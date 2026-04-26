import type { MetadataRoute } from "next";
import { getSeoSitemapCombos, getSiteUrl } from "@/lib/listing-seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now },
    { url: `${baseUrl}/listings`, lastModified: now },
  ];

  const combos = process.env.DATABASE_URL ? await getSeoSitemapCombos() : [];

  const seoEntries: MetadataRoute.Sitemap = combos.map(function (combo) {
    const path = combo.locationSlug
      ? `/listings/c/${combo.categorySlug}/${combo.locationSlug}`
      : `/listings/c/${combo.categorySlug}`;

    return {
      url: `${baseUrl}${path}`,
      lastModified: now,
    };
  });

  return staticEntries.concat(seoEntries);
}
