import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
import { createServerClient } from "@lib/supabase";
import { siteConfig } from "@config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();
  const { data: posts } = await supabase
    .from("bookworm_posts")
    .select("cat1, cat2, slug, updated_at")
    .eq("status", "published");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteConfig.url}/tags`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteConfig.url}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/docs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p: any) => ({
    url: `${siteConfig.url}/blog/${p.cat1}/${p.cat2}/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...postRoutes];
}
