import type { Metadata } from "next";
export const metadata: Metadata = { title: "Roadmap" };
export default function RoadmapPage() {
  return (
    <div>
      <h1>Roadmap</h1>
      <p>Here's what we're planning next. These suggestions aim to improve performance, traffic handling, marketplace readiness, architecture, free-tier friendliness, and security.</p>
      <h2>Performance</h2>
      <ul>
        <li>ISR (Incremental Static Regeneration) for post pages — revalidate every 60s instead of SSR</li>
        <li>Edge caching for public read endpoints via Upstash Redis</li>
        <li>Image optimization pipeline with automatic WebP/AVIF conversion</li>
        <li>Bundle analysis and code-splitting for admin dashboard</li>
      </ul>
      <h2>Traffic & Scaling</h2>
      <ul>
        <li>Full-text search via Supabase pg_trgm (faster than ILIKE)</li>
        <li>Read replicas for post reads at scale</li>
        <li>CDN-cached category and tag pages with tag-based revalidation</li>
        <li>Rate limiting on sync and payment endpoints via Upstash</li>
      </ul>
      <h2>Marketplace Readiness</h2>
      <ul>
        <li>Premium tier with paywalled posts (Lipia subscription support)</li>
        <li>Author analytics dashboard with charts (views over time, top posts)</li>
        <li>Email newsletter integration (Resend once key is regenerated)</li>
        <li>Custom domains for author profiles</li>
      </ul>
      <h2>Architecture</h2>
      <ul>
        <li>Supabase Edge Function for sync worker (lower latency than Vercel serverless)</li>
        <li>Background job queue for bulk sheet operations</li>
        <li>Database migrations via Supabase CLI</li>
        <li>Typed Supabase client with generated types</li>
      </ul>
      <h2>Free-Tier Friendliness</h2>
      <ul>
        <li>Move sync cron to Supabase scheduled functions (free tier includes cron)</li>
        <li>Compress sheet content before sync to reduce API quota usage</li>
        <li>Client-side caching of post reads to reduce Supabase requests</li>
      </ul>
      <h2>Security</h2>
      <ul>
        <li>CSRF tokens for all mutations</li>
        <li>Content Security Policy headers</li>
        <li>Hotlink protection for images</li>
        <li>Scraping protection (bot detection middleware)</li>
      </ul>
    </div>
  );
}
