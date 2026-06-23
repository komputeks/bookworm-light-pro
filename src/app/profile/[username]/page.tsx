import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { getProfileByUsername, getPosts } from "@actions/posts";
import { notFound } from "next/navigation";
import PostCard from "@components/blog/PostCard";
import Pagination from "@components/blog/Pagination";
import { siteConfig } from "@config";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: "Author not found" };
  return {
    title: `${profile.username}`,
    description: profile.bio ?? `Posts by ${profile.username} on ${siteConfig.name}`,
  };
}

export default async function ProfilePage({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<{ page?: string; tag?: string }> }) {
  const { username } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1", 10);
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const { posts, total } = await getPosts({ authorId: profile.user_id, page, perPage: 9, tag: sp.tag });
  const totalPages = Math.ceil(total / 9);

  return (
    <div className="section">
      <div className="container-wide">
        {/* Profile header */}
        <div className="mb-12 text-center">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.username} className="mx-auto mb-4 h-24 w-24 rounded-full" />
          ) : (
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">
              {profile.username[0]?.toUpperCase()}
            </div>
          )}
          <h1 className="mb-2 text-3xl font-bold text-text-dark dark:text-white">{profile.username}</h1>
          {profile.bio && <p className="mx-auto max-w-md text-text">{profile.bio}</p>}
          <p className="mt-2 text-sm text-text">{total} {total === 1 ? "post" : "posts"} · Joined {new Date(profile.created_at).getFullYear()}</p>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <p className="text-center text-text">No posts yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} basePath={`/profile/${username}`} />
      </div>
    </div>
  );
}
