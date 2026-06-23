import type { Metadata } from "next";
export const metadata: Metadata = { title: "Changelog" };
export default function ChangelogPage() {
  return (
    <div>
      <h1>Changelog</h1>
      <h2>v1.0.0 — Initial Release</h2>
      <h3>Added</h3>
      <ul>
        <li>Bi-directional Google Sheets ↔ Supabase sync with conflict resolution</li>
        <li>Medium-style claps, threaded comments, reading time</li>
        <li>Post permalinks: /blog/cat1/cat2/post-slug</li>
        <li>Author profile pages with pagination and search</li>
        <li>Admin dashboard (posts, users, sync logs, payments, settings)</li>
        <li>User dashboard with analytics and sheet setup flow</li>
        <li>Lipia M-Pesa payment integration (STK Push + callbacks)</li>
        <li>Dark/light theme toggle with system preference</li>
        <li>PWA manifest and service worker</li>
        <li>SEO: sitemap.xml, robots.txt, RSS feed, JSON-LD structured data</li>
        <li>Docs: landing copy, user manual, changelog, roadmap</li>
      </ul>
      <h3>Architecture Decisions</h3>
      <ul>
        <li><strong>Next.js 16 App Router with Server Components</strong> — chosen for SEO (server-rendered content) and performance (minimal client JS). Client components used only for interactivity (claps, comments, theme toggle, forms).</li>
        <li><strong>Supabase as primary data store</strong> — fast reads/writes, RLS for security, real-time capable. Google Sheets is a secondary, author-friendly editing surface.</li>
        <li><strong>Service account for Sheets API</strong> — users share their sheet with the service account email. No OAuth flow needed for sheet access, simpler UX.</li>
        <li><strong>Multi-mechanism sync</strong> — on-demand + Drive Push + cron. Each has different latency and reliability characteristics; together they provide robust coverage.</li>
        <li><strong>Zod validation everywhere</strong> — forms, API requests, env vars. Never trust external input.</li>
      </ul>
      <h3>Anti-Patterns Avoided</h3>
      <ul>
        <li><strong>No NextAuth</strong> — used Supabase Auth directly per project rules. Supabase handles sessions, JWTs, and OAuth.</li>
        <li><strong>No client-side data fetching for sensitive data</strong> — all mutations go through authenticated API routes that verify the user server-side.</li>
        <li><strong>No giant files</strong> — each component/service is under 500 LOC. Feature-driven folder structure keeps concerns isolated.</li>
        <li><strong>No hardcoded data</strong> — every piece of content comes from Supabase via API routes or server actions.</li>
      </ul>
    </div>
  );
}
