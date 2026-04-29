import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/listing-seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/listings", "/listings/c"],
      disallow: [
        "/admin",
        "/api",
        "/auth",
        "/messages",
        "/orders",
        "/profile",
        "/watchlist",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
