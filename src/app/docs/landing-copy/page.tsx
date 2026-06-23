import type { Metadata } from "next";
export const metadata: Metadata = { title: "Landing Copy" };
export default function LandingCopyPage() {
  return (
    <div>
      <h1>Welcome to Bookworm Light Pro</h1>
      <p>Hey there! Ever wished writing blog posts felt as easy as filling out a spreadsheet? That's exactly what we built. Bookworm Light Pro takes the clean, distraction-free reading experience of Medium and pairs it with something pretty magical: your content lives in both a fast, modern database <em>and</em> a Google Sheet you already know how to use.</p>
      <h2>Write Wherever You Want</h2>
      <p>Prefer the focused editor in the app? Go for it. More comfortable tweaking things in Google Sheets? That works too. Every change — whether it's a new post, a quick edit, or even a typo fix — syncs automatically in both directions. No exports, no imports, no copy-paste. Just write.</p>
      <h2>Built for Readers Too</h2>
      <p>Your readers get a beautiful, fast-loading experience with claps (because likes are so 2010), threaded comments, reading time estimates, and dark mode that actually respects their system preference. Every post has a clean permalink like <code>/blog/technology/web-dev/my-post</code> that's easy to share and easy for Google to love.</p>
      <h2>Ready to Try It?</h2>
      <p><a href="/signup">Create your free account</a>, connect a Google Sheet, and start publishing in under 5 minutes. Seriously.</p>
    </div>
  );
}
