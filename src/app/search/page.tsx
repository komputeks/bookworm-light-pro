import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { getPosts } from "@actions/posts";
import PostCard from "@components/blog/PostCard";
import Pagination from "@components/blog/Pagination";

export const metadata: Metadata = { title: "Search", description: "Search posts" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const q = params.q ?? "";
  const page = parseInt(params.page ?? "1", 10);
  const { posts, total } = await getPosts({ search: q, page, perPage: 12 });
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="section">
      <div className="container-wide">
        <h1 className="mb-8 text-center text-3xl font-bold text-text-dark dark:text-white">
          {q ? <>Search results for <span className="text-primary">"{q}"</span></> : "Search"}
        </h1>

        <form action="/search" className="mx-auto mb-8 flex max-w-xl gap-2">
          <input type="text" name="q" defaultValue={q} placeholder="Search posts..." className="input" />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {q && (
          <p className="mb-6 text-center text-text">{total} {total === 1 ? "result" : "results"} found</p>
        )}

        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : q ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center dark:border-gray-600">
            <p className="text-lg font-semibold text-text-dark dark:text-white">No results found</p>
            <p className="text-text">Try different keywords or browse <a href="/blog" className="text-primary underline">all posts</a>.</p>
          </div>
        ) : null}

        {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} basePath={`/search?q=${encodeURIComponent(q)}`} />}
      </div>
    </div>
  );
}
