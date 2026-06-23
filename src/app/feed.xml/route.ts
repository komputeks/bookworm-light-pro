import { createServerClient } from "@lib/supabase";
import { siteConfig } from "@config";

export const dynamic = "force-dynamic";

/** RSS 2.0 feed — generated from published posts. */
export async function GET() {
  const supabase = createServerClient();
  const { data: posts } = await supabase
    .from("bookworm_posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (posts ?? []).map((p: any) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${siteConfig.url}/blog/${p.cat1}/${p.cat2}/${p.slug}</link>
      <guid isPermaLink="true">${siteConfig.url}/blog/${p.cat1}/${p.cat2}/${p.slug}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt ?? ""}]]></description>
      <category>${p.cat1}</category>
      <category>${p.cat2}</category>
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${siteConfig.name}]]></title>
    <link>${siteConfig.url}</link>
    <description><![CDATA[${siteConfig.description}]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
