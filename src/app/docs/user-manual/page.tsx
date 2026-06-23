import type { Metadata } from "next";
export const metadata: Metadata = { title: "User Manual" };
export default function UserManualPage() {
  return (
    <div>
      <h1>User Manual</h1>
      <h2>Getting Started</h2>
      <ol>
        <li><strong>Sign up</strong> — Create an account with your email or Google.</li>
        <li><strong>Create a Google Spreadsheet</strong> — Go to <a href="https://sheets.new" target="_blank">sheets.new</a> to create a new, empty spreadsheet.</li>
        <li><strong>Share it with our service account</strong> — In your spreadsheet, click "Share" and add the service account email (shown on your dashboard) as an <strong>Editor</strong>.</li>
        <li><strong>Initialize your sheet</strong> — Copy the spreadsheet URL, paste it into your dashboard, and click "Initialize Sheet". We'll rename it and set up all the columns automatically.</li>
        <li><strong>Start writing</strong> — Use the built-in editor or write directly in your spreadsheet. Everything syncs automatically.</li>
      </ol>
      <h2>Writing Posts</h2>
      <p>You can write posts in two ways:</p>
      <ul>
        <li><strong>In the app:</strong> Go to Dashboard → New Post. Fill in the title, categories, content (Markdown supported), and tags. Save as draft or publish immediately.</li>
        <li><strong>In your spreadsheet:</strong> Edit any column directly. Changes sync to the site within minutes (or instantly if you click "Sync Now").</li>
      </ul>
      <h2>Sheet Columns</h2>
      <p>Your sheet has these columns:</p>
      <ul>
        <li><code>post_id</code> — System-generated ID (don't edit)</li>
        <li><code>cat1</code>, <code>cat2</code> — Primary and secondary categories (e.g. technology, web-dev)</li>
        <li><code>title</code> — Post title</li>
        <li><code>slug</code> — URL slug (auto-generated from title)</li>
        <li><code>excerpt</code> — Short summary</li>
        <li><code>content</code> — Full post content in Markdown</li>
        <li><code>tags</code> — Comma-separated tags</li>
        <li><code>status</code> — draft, published, or archived</li>
        <li><code>featured_image</code> — URL to the cover image</li>
        <li><code>likes</code>, <code>comments</code>, <code>view_count</code> — System-managed (read-only in sheet)</li>
        <li><code>created_at</code>, <code>last_modified</code> — Timestamps</li>
      </ul>
      <h2>Sync Behavior</h2>
      <p>Sync runs automatically via three mechanisms:</p>
      <ul>
        <li><strong>On-demand:</strong> Click "Sync Now" in your dashboard for an immediate sync.</li>
        <li><strong>Drive Push Notifications:</strong> When you edit your sheet, Google notifies us within seconds.</li>
        <li><strong>Cron backup:</strong> A scheduled job runs every 10 minutes as a safety net.</li>
      </ul>
      <p><strong>Conflict resolution:</strong> When both the app and sheet are edited, the one with the newer <code>last_modified</code> timestamp wins. System columns (likes, comments, views) always flow from the app to the sheet — never the other way.</p>
    </div>
  );
}
