import type { Metadata } from "next";
import { siteConfig } from "@config";

export const metadata: Metadata = { title: "About", description: `About ${siteConfig.name}` };

export default function AboutPage() {
  return (
    <div className="section">
      <div className="container-book">
        <h1 className="mb-6 text-3xl font-bold text-text-dark dark:text-white">About {siteConfig.name}</h1>
        <div className="prose-bookworm max-w-none">
          <p>
            {siteConfig.name} is a modern blogging platform built on Next.js 16, Supabase, and Google Sheets.
            It combines the reading experience of Medium.com with the flexibility of editing your content
            in a familiar spreadsheet interface.
          </p>
          <h2>How It Works</h2>
          <p>
            Every author connects their own Google Spreadsheet to the platform. When you write a post in the
            built-in editor, it's saved to Supabase for fast reads and instantly replicated to your spreadsheet.
            Edit in the spreadsheet? Changes sync back to Supabase automatically. Everything stays in perfect sync.
          </p>
          <h2>Key Features</h2>
          <ul>
            <li>Bi-directional sync between Supabase and Google Sheets</li>
            <li>Medium-style claps, comments, and reading time</li>
            <li>Author profile pages with search and filters</li>
            <li>SEO-optimized with structured data, sitemaps, and RSS feeds</li>
            <li>Dark/light mode with system preference detection</li>
            <li>PWA installable on mobile devices</li>
          </ul>
          <h2>Get Started</h2>
          <p>
            <a href="/signup">Create an account</a>, set up your Google Sheet, and start publishing.
            It's free and takes less than 5 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
