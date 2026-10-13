import type { MetadataRoute } from "next";
import { inventory, siteUrl } from "@/lib/vehicles";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await inventory();
  const origin = siteUrl();
  return [
    ...["", "/marketplace", "/affordability", "/compare", "/sources", "/privacy"].map((path) => ({
      url: `${origin}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...data.vehicles.map((v) => ({
      url: `${origin}/vehicles/${v.id}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
