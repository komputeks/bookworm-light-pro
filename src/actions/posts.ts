/**
 * Post data access layer — server-side functions for fetching posts from Supabase.
 * These are called from server components and route handlers.
 */
import { createServerClient } from "@lib/supabase";
import { siteConfig } from "@config";
import type { PostWithAuthor, Post } from "@types";

/** Fetch published posts with author info, paginated. */
export async function getPosts(opts: {
  page?: number;
  perPage?: number;
  cat1?: string;
  cat2?: string;
  tag?: string;
  authorId?: string;
  search?: string;
}): Promise<{ posts: PostWithAuthor[]; total: number }> {
  const supabase = createServerClient();
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? siteConfig.postsPerPage;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("bookworm_posts")
    .select(
      `*,
       author:bookworm_profiles!author_id(id, username, avatar_url, bio),
       comment_count:bookworm_post_comments(count)`,
      { count: "exact" }
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (opts.cat1) query = query.eq("cat1", opts.cat1);
  if (opts.cat2) query = query.eq("cat2", opts.cat2);
  if (opts.tag) query = query.contains("tags", [opts.tag]);
  if (opts.authorId) query = query.eq("author_id", opts.authorId);
  if (opts.search) {
    query = query.or(`title.ilike.%${opts.search}%,excerpt.ilike.%${opts.search}%,content_md.ilike.%${opts.search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const posts = (data ?? []).map((p: any) => ({
    ...p,
    comment_count: p.comment_count?.[0]?.count ?? 0,
  })) as PostWithAuthor[];

  return { posts, total: count ?? 0 };
}

/** Fetch a single post by cat1/cat2/slug (permalink structure). */
export async function getPostBySlug(cat1: string, cat2: string, slug: string): Promise<PostWithAuthor | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("bookworm_posts")
    .select(
      `*,
       author:bookworm_profiles!author_id(id, username, avatar_url, bio),
       comment_count:bookworm_post_comments(count)`
    )
    .eq("cat1", cat1)
    .eq("cat2", cat2)
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return {
    ...data,
    comment_count: data.comment_count?.[0]?.count ?? 0,
  } as PostWithAuthor;
}

/** Fetch related posts by the same author or sharing tags. */
export async function getRelatedPosts(post: Post, limit = 3): Promise<PostWithAuthor[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("bookworm_posts")
    .select(`*, author:bookworm_profiles!author_id(id, username, avatar_url), comment_count:bookworm_post_comments(count)`)
    .eq("status", "published")
    .eq("author_id", post.author_id)
    .neq("id", post.id)
    .limit(limit);
  return (data ?? []).map((p: any) => ({ ...p, comment_count: p.comment_count?.[0]?.count ?? 0 })) as PostWithAuthor[];
}

/** Fetch featured posts for the homepage hero. */
export async function getFeaturedPosts(limit = 5): Promise<PostWithAuthor[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("bookworm_posts")
    .select(`*, author:bookworm_profiles!author_id(id, username, avatar_url), comment_count:bookworm_post_comments(count)`)
    .eq("status", "published")
    .order("likes", { ascending: false })
    .limit(limit);
  return (data ?? []).map((p: any) => ({ ...p, comment_count: p.comment_count?.[0]?.count ?? 0 })) as PostWithAuthor[];
}

/** Fetch all categories with post counts. */
export async function getCategories(): Promise<{ cat1: string; count: number }[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("bookworm_posts")
    .select("cat1")
    .eq("status", "published");
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const c = (row as any).cat1;
    counts[c] = (counts[c] ?? 0) + 1;
  }
  return Object.entries(counts).map(([cat1, count]) => ({ cat1, count })).sort((a, b) => b.count - a.count);
}

/** Fetch all tags with post counts. */
export async function getTags(): Promise<{ tag: string; count: number }[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("bookworm_posts").select("tags").eq("status", "published");
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    for (const tag of (row as any).tags ?? []) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return Object.entries(counts).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}

/** Fetch a profile by username. */
export async function getProfileByUsername(username: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("bookworm_profiles")
    .select("*")
    .eq("username", username)
    .single();
  return data;
}

/** Increment post view count (fire-and-forget). */
export async function incrementViewCount(postId: string): Promise<void> {
  const supabase = createServerClient();
  try {
    await supabase.rpc("increment_view_count", { post_id: postId });
  } catch {
    // Fire-and-forget — view count increment failures are non-critical
  }
}

/** Check if a user has liked a post. */
export async function hasUserLiked(postId: string, userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const supabase = createServerClient();
  const { data } = await supabase
    .from("bookworm_post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}
