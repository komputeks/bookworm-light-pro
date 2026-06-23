import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getRelatedPosts, incrementViewCount, hasUserLiked } from "@actions/posts";
import { renderMarkdown, formatDate, readingTime, extractHeadings, slugify } from "@lib/utils";
import { siteConfig } from "@config";
import { createServerClient } from "@lib/supabase";
import ClapButton from "@components/blog/ClapButton";
import CommentsSection from "@components/blog/CommentsSection";
import ShareBar from "@components/blog/ShareBar";
import PostListItem from "@components/blog/PostListItem";
import { FaRegClock, FaRegEye } from "react-icons/fa6";
import { FaRegComment } from "react-icons/fa";
import { headers } from "next/headers";

export async function generateMetadata({ params }: { params: Promise<{ cat1: string; cat2: string; slug: string }> }): Promise<Metadata> {
  const { cat1, cat2, slug } = await params;
  const post = await getPostBySlug(cat1, cat2, slug);
  if (!post) return { title: "Post not found" };

  const url = `${siteConfig.url}/blog/${cat1}/${cat2}/${slug}`;
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? "",
      url,
      images: post.featured_image ? [{ url: post.featured_image }] : undefined,
      publishedTime: post.created_at,
      authors: post.author ? [post.author.username] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? "",
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ cat1: string; cat2: string; slug: string }> }) {
  const { cat1, cat2, slug } = await params;
  const post = await getPostBySlug(cat1, cat2, slug);
  if (!post) notFound();

  // Increment view count (fire-and-forget)
  incrementViewCount(post.id);

  // Get current user ID for like check
  const h = await headers();
  const authHeader = h.get("authorization");
  let userId: string | undefined;
  if (authHeader) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    userId = user?.id;
  }
  const liked = await hasUserLiked(post.id, userId);

  const html = renderMarkdown(post.content_md);
  const headings = extractHeadings(post.content_md);
  const related = await getRelatedPosts(post, 3);
  const postUrl = `${siteConfig.url}/blog/${cat1}/${cat2}/${slug}`;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: post.author ? { "@type": "Person", name: post.author.username } : undefined,
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
  };

  // Breadcrumb JSON-LD
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: cat1, item: `${siteConfig.url}/blog/${cat1}` },
      { "@type": "ListItem", position: 3, name: cat2, item: `${siteConfig.url}/blog/${cat1}/${cat2}` },
      { "@type": "ListItem", position: 4, name: post.title, item: postUrl },
    ],
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-theme-light dark:border-gray-700 dark:bg-gray-800/50">
        <div className="container-book py-3 text-sm text-text">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/blog/${cat1}`} className="hover:text-primary">{cat1.replace(/-/g, " ")}</Link>
          <span className="mx-2">/</span>
          <Link href={`/blog/${cat1}/${cat2}`} className="hover:text-primary">{cat2.replace(/-/g, " ")}</Link>
        </div>
      </div>

      {/* Reading progress bar (client component injected) */}
      <ReadingProgress />

      <div className="container-book py-12">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm text-text">
            {post.author && (
              <Link href={`/profile/${post.author.username}`} className="flex items-center gap-2 hover:text-primary">
                {post.author.avatar_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.avatar_url} alt={post.author.username} className="h-6 w-6 rounded-full" />
                )}
                <span className="font-semibold">{post.author.username}</span>
              </Link>
            )}
            <span>{formatDate(post.created_at)}</span>
            <span className="flex items-center gap-1"><FaRegClock /> {readingTime(post.content_md)} min read</span>
            <span className="flex items-center gap-1"><FaRegEye /> {post.view_count} views</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-text-dark dark:text-white">{post.title}</h1>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/tags/${tag}`} className="badge badge-primary">#{tag}</Link>
              ))}
            </div>
          )}
        </header>

        {/* Featured image */}
        {post.featured_image && (
          <div className="mb-8 overflow-hidden rounded-xl">
            <Image src={post.featured_image} alt={post.title} width={1000} height={500} className="w-full object-cover" priority />
          </div>
        )}

        {/* Table of contents */}
        {headings.length > 2 && (
          <details className="mb-8 rounded-lg border border-border bg-theme-light p-4 dark:border-gray-700 dark:bg-gray-800">
            <summary className="cursor-pointer font-semibold text-text-dark dark:text-white">Table of Contents</summary>
            <ul className="mt-3 space-y-1 text-sm">
              {headings.map((h, i) => (
                <li key={i} style={{ paddingLeft: `${(h.level - 2) * 16}px` }}>
                  <a href={`#${h.slug}`} className="text-text hover:text-primary">{h.text}</a>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Content */}
        <div className="prose-bookworm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />

        {/* Footer: claps + share */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8 dark:border-gray-700">
          <ClapButton postId={post.id} initialLikes={post.likes} liked={liked} />
          <ShareBar title={post.title} url={postUrl} />
        </div>

        {/* Comments */}
        <CommentsSection postId={post.id} />
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="section bg-theme-light dark:bg-gray-800/50">
          <div className="container-wide">
            <h2 className="mb-8 text-center text-2xl font-bold text-text-dark dark:text-white">More from this author</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostListItem key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

/** Client component for reading progress bar. */
function ReadingProgress() {
  return (
    <div className="reading-progress" style={{ width: "0%" }} id="reading-progress-bar" />
  );
}
