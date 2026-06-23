/** Text and content utility functions — slugify, humanize, reading time, markdown. */
import { slug as githubSlug } from "github-slugger";
import { marked } from "marked";

/** Convert a string to a URL-safe slug. */
export function slugify(content: string | null | undefined): string | null {
  if (!content) return null;
  return githubSlug(content);
}

/** Convert a slug/kebab-case string to human-readable Title Case. */
export function humanize(content: string | null | undefined): string | null {
  if (!content) return null;
  return content
    .replace(/^[\s_]+|[\s_]+$/g, "")
    .replace(/[_\s]+/g, " ")
    .replace(/^[a-z]/, (m) => m.toUpperCase());
}

/** Strip HTML tags from a string to get plain text. */
export function plainify(content: string | null | undefined): string {
  if (!content) return "";
  const mdParsed = marked.parseInline(String(content), { async: false }) as string;
  const filterBrackets = mdParsed.replace(/<\/?[^>]+(>|$)/gm, "");
  const filterSpaces = filterBrackets.replace(/[\r\n]\s*[\r\n]/gm, "");
  return filterSpaces.trim();
}

/** Format an ISO date string to a human-readable format. */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Calculate estimated reading time in minutes from markdown content. */
export function readingTime(content: string): number {
  const wordsPerMinute = 200;
  const text = plainify(content);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/** Generate a short excerpt from markdown content. */
export function generateExcerpt(content: string, length: number = 200): string {
  const text = plainify(content);
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

/** Render markdown to HTML (server-side). */
export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}

/** Extract all headings from markdown for table of contents. */
export function extractHeadings(content: string): { level: number; text: string; slug: string }[] {
  const headings: { level: number; text: string; slug: string }[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match && match[1] && match[2]) {
      const level = match[1].length;
      const text = match[2].trim();
      headings.push({ level, text, slug: slugify(text) ?? "" });
    }
  }
  return headings;
}
