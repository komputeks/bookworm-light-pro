import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { getPosts, getCategories } from "@actions/posts";
import { siteConfig } from "@config";
import PostCard from "@components/blog/PostCard";
import Pagination from "@components/blog/Pagination";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: `Browse all posts on ${siteConfig.name}`,
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const perPage = siteConfig.postsPerPage;
  const [{ posts, total }, categories] = await Promise.all([
    getPosts({ page, perPage }),
    getCategories(),
  ]);
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="section">
      <div className="container-wide">
        <h1 className="mb-2 text-3xl font-bold text-text-dark dark:text-white">All Posts</h1>
        <p className="mb-8 text-text">{total} {total === 1 ? "post" : "posts"} and counting</p>

        {/* Category filter pills */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link href="/blog" className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${page === 1 && !params.page ? "bg-primary text-white" : "bg-theme-light text-text-dark hover:bg-primary hover:text-white dark:bg-gray-800 dark:text-white"}`}>All</Link>
            {categories.map(({ cat1, count }) => (
              <Link key={cat1} href={`/blog/${cat1}`} className="rounded-lg bg-theme-light px-3 py-1.5 text-sm font-semibold text-text-dark transition hover:bg-primary hover:text-white dark:bg-gray-800 dark:text-white">
                {cat1.replace(/-/g, " ")} ({count})
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center dark:border-gray-600">
            <p className="text-lg font-semibold text-text-dark dark:text-white">No posts yet</p>
            <p className="text-text">Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} basePath="/blog" />
      </div>
    </div>
  );
}
