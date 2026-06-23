import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { getTags } from "@actions/posts";
import Link from "next/link";

export const metadata: Metadata = { title: "Tags", description: "Browse all tags" };

export default async function TagsPage() {
  const tags = await getTags();
  return (
    <div className="section">
      <div className="container-book text-center">
        <h1 className="mb-8 text-3xl font-bold text-text-dark dark:text-white">Tags</h1>
        {tags.length === 0 ? (
          <p className="text-text">No tags yet.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {tags.map(({ tag, count }) => (
              <Link key={tag} href={`/tags/${tag}`}
                className="rounded-lg bg-theme-light px-4 py-2 font-semibold text-text-dark transition hover:bg-primary hover:text-white dark:bg-gray-800 dark:text-white">
                #{tag} ({count})
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
