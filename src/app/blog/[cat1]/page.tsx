import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { getPosts, getCategories } from "@actions/posts";
import { siteConfig } from "@config";
import PostCard from "@components/blog/PostCard";
import Pagination from "@components/blog/Pagination";

export default async function CategoryPage({ params }: { params: Promise<{ cat1: string }> }) {
  const { cat1 } = await params;
  const posts = await getPosts({ cat1, perPage: 100 });
  const categories = await getCategories();

  if (posts.posts.length === 0 && !categories.some((c) => c.cat1 === cat1)) {
    notFound();
  }

  return (
    <div className="section">
      <div className="container-wide">
        <h1 className="mb-2 text-3xl font-bold capitalize text-text-dark dark:text-white">{cat1.replace(/-/g, " ")}</h1>
        <p className="mb-8 text-text">{posts.total} {posts.total === 1 ? "post" : "posts"} in this category</p>

        {posts.posts.length === 0 ? (
          <p className="text-center text-text">No posts in this category yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
