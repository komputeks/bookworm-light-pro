import { getFeaturedPosts, getPosts, getCategories } from "@actions/posts";
import { siteConfig } from "@config";
import PostCard from "@components/blog/PostCard";
import Link from "next/link";
import { FaArrowRight, FaNewspaper } from "react-icons/fa";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ posts: latestPosts, total }, featuredPosts, categories] = await Promise.all([
    getPosts({ page: 1, perPage: siteConfig.postsPerPage }),
    getFeaturedPosts(5),
    getCategories(),
  ]);

  const heroPost = featuredPosts[0];
  const sidePosts = featuredPosts.slice(1, 5);
  const totalPages = Math.ceil(total / siteConfig.postsPerPage);

  return (
    <div className="pb-16">
      {/* Hero Section */}
      {heroPost && (
        <section className="border-b border-border bg-theme-light dark:border-gray-700 dark:bg-gray-800/50">
          <div className="container-wide grid gap-6 py-12 lg:grid-cols-2">
            <div className="lg:row-span-2">
              <PostCard post={heroPost} featured />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {sidePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts */}
      <section className="section">
        <div className="container-wide">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-text-dark dark:text-white">
              <FaNewspaper className="text-primary" /> Latest Posts
            </h2>
            <Link href="/blog" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View all <FaArrowRight />
            </Link>
          </div>

          {latestPosts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center dark:border-gray-600">
              <p className="mb-2 text-lg font-semibold text-text-dark dark:text-white">No posts yet</p>
              <p className="text-text">Be the first to publish. Sign in and start writing!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 text-center">
              <Link href="/blog" className="btn btn-outline">Load More</Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section bg-theme-light dark:bg-gray-800/50">
          <div className="container-wide">
            <h2 className="mb-8 text-center text-2xl font-bold text-text-dark dark:text-white">Browse by Category</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map(({ cat1, count }) => (
                <Link
                  key={cat1}
                  href={`/blog/${cat1}`}
                  className="group flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-3 transition hover:border-primary hover:shadow-md dark:border-gray-600 dark:bg-gray-800"
                >
                  <span className="font-semibold capitalize text-text-dark group-hover:text-primary dark:text-white">{cat1.replace(/-/g, " ")}</span>
                  <span className="badge badge-primary">{count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section">
        <div className="container-book rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Start Writing Today</h2>
          <p className="mx-auto mb-6 max-w-md text-white/90">
            Create posts in the app or in your own Google Spreadsheet. Everything stays perfectly in sync.
          </p>
          <Link href="/signup" className="btn bg-white text-primary hover:bg-gray-100">
            Get Started — It's Free
          </Link>
        </div>
      </section>
    </div>
  );
}
