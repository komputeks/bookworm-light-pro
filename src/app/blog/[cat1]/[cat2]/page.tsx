import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { getPosts } from "@actions/posts";
import PostCard from "@components/blog/PostCard";

export default async function SubCategoryPage({ params }: { params: Promise<{ cat1: string; cat2: string }> }) {
  const { cat1, cat2 } = await params;
  const { posts, total } = await getPosts({ cat1, cat2, perPage: 100 });

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="section">
      <div className="container-wide">
        <h1 className="mb-2 text-3xl font-bold capitalize text-text-dark dark:text-white">
          {cat1.replace(/-/g, " ")} / {cat2.replace(/-/g, " ")}
        </h1>
        <p className="mb-8 text-text">{total} {total === 1 ? "post" : "posts"}</p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
