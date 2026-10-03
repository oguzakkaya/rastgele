import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/copy";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/konu", "/sonuc", "/gecmis"] }],
    sitemap: `${BRAND.url}/sitemap.xml`,
  };
}
