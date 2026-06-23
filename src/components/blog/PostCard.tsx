import Link from "next/link";
import Image from "next/image";
import type { PostWithAuthor } from "@types";
import { formatDate, generateExcerpt } from "@lib/utils";
import { FaRegHeart, FaRegComment, FaRegEye } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa6";

/** Reusable post card — used in grids, lists, search results, profile pages. */
export default function PostCard({ post, featured = false }: { post: PostWithAuthor; featured?: boolean }) {
  const excerpt = post.excerpt || generateExcerpt(post.content_md, 150);
  const href = `/blog/${post.cat1}/${post.cat2}/${post.slug}`;

  return (
    <article className={`card group overflow-hidden ${featured ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      {post.featured_image && (
        <Link href={href} className="block overflow-hidden">
          <Image
            src={post.featured_image}
            alt={post.title}
            width={featured ? 1000 : 445}
            height={featured ? 475 : 230}
            className="w-full object-cover transition duration-300 group-hover:scale-105"
            priority={featured}
          />
        </Link>
      )}
      <div className="p-5">
        {/* Meta: author, date, category */}
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-text">
          {post.author && (
            <Link href={`/profile/${post.author.username}`} className="flex items-center gap-1.5 hover:text-primary">
              {post.author.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.author.avatar_url} alt={post.author.username} className="h-5 w-5 rounded-full" />
              )}
              <span className="font-semibold">{post.author.username}</span>
            </Link>
          )}
          <span>{formatDate(post.created_at)}</span>
          <Link href={`/blog/${post.cat1}`} className="text-primary hover:underline">{post.cat1}</Link>
        </div>

        {/* Title */}
        <h3 className={`mb-2 font-bold ${featured ? "text-2xl" : "text-lg"}`}>
          <Link href={href} className="text-text-dark transition hover:text-primary dark:text-white">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="mb-3 line-clamp-2 text-sm text-text">{excerpt}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={`/tags/${tag}`} className="badge badge-primary">#{tag}</Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-text">
          <span className="flex items-center gap-1"><FaRegHeart /> {post.likes}</span>
          <span className="flex items-center gap-1"><FaRegComment /> {post.comment_count}</span>
          <span className="flex items-center gap-1"><FaRegEye /> {post.view_count}</span>
        </div>
      </div>
    </article>
  );
}
