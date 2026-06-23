import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { getPosts } from "@actions/posts";
import PostCard from "@components/blog/PostCard";
import Pagination from "@components/blog/Pagination";
import { humanize } from "@lib/utils";

export default async function TagPage({ params, searchParams }: { params: Promise<{ tag: string }>; searchParams: Promise<{ page?: string }> }) {
  const { tag } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1", 10);
  const { posts, total } = await getPosts({ tag, page, perPage: 12 });
  const totalPages = Math.ceil(total / 12);

  if (posts.length === 0 && page === 1) {
    notFound();
  }

  return (
    <div className="section">
      <div className="container-wide">
        <h1 className="mb-8 text-center text-3xl font-bold text-text-dark dark:text-white">
          Posts tagged <span className="text-primary">#{humanize(tag)}</span>
        </h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        <Pagination currentPage={page} totalPages={totalPages} basePath={`/tags/${tag}`} />
      </div>
    </div>
  );
}
