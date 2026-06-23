import Link from "next/link";
import { FaRegClock } from "react-icons/fa6";
import type { PostWithAuthor } from "@types";
import { formatDate, readingTime, generateExcerpt, renderMarkdown } from "@lib/utils";
import Image from "next/image";

/** Compact horizontal post card — used in sidebars and 'More from author' sections. */
export default function PostListItem({ post }: { post: PostWithAuthor }) {
  const href = `/blog/${post.cat1}/${post.cat2}/${post.slug}`;
  const excerpt = post.excerpt || generateExcerpt(post.content_md, 100);

  return (
    <article className="flex gap-4">
      {post.featured_image && (
        <Link href={href} className="flex-shrink-0">
          <Image src={post.featured_image} alt={post.title} width={120} height={80} className="rounded-lg object-cover" />
        </Link>
      )}
      <div className="flex-1">
        <h4 className="mb-1 font-semibold leading-snug">
          <Link href={href} className="text-text-dark hover:text-primary dark:text-white">{post.title}</Link>
        </h4>
        <p className="line-clamp-1 text-xs text-text">{excerpt}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-text">
          <span>{formatDate(post.created_at)}</span>
          <span className="flex items-center gap-1"><FaRegClock /> {readingTime(post.content_md)} min</span>
        </div>
      </div>
    </article>
  );
}
