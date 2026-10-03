import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/copy";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BRAND.url}/`, changeFrequency: "weekly", priority: 1 },
  ];
}
