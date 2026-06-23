/** Zod validation schemas for all external input — forms, API requests, query params. */
import { z } from "zod";

/** Post create/update schema. */
export const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  cat1: z.string().min(1, "Category 1 is required").max(100),
  cat2: z.string().min(1, "Category 2 is required").max(100),
  excerpt: z.string().max(500).optional().default(""),
  content_md: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured_image: z.string().url().optional().or(z.literal("")),
});
export type PostInput = z.infer<typeof postSchema>;

/** Profile update schema. */
export const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens and underscores"),
  bio: z.string().max(500).optional().default(""),
  avatar_url: z.string().url().optional().or(z.literal("")),
});
export type ProfileInput = z.infer<typeof profileSchema>;

/** Comment create schema. */
export const commentSchema = z.object({
  post_id: z.string().uuid(),
  parent_id: z.string().uuid().optional().or(z.null()),
  body: z.string().min(1, "Comment cannot be empty").max(2000),
});
export type CommentInput = z.infer<typeof commentSchema>;

/** Sheet initialization schema. */
export const sheetInitSchema = z.object({
  sheet_url: z.string().min(1, "Sheet URL is required"),
});
export type SheetInitInput = z.infer<typeof sheetInitSchema>;

/** Payment initiation schema. */
export const paymentSchema = z.object({
  phone_number: z.string().min(10, "Valid phone number required").max(15),
  amount: z.number().int().min(1, "Amount must be at least 1"),
  external_reference: z.string().optional().default(""),
  metadata: z.record(z.unknown()).optional(),
});
export type PaymentInput = z.infer<typeof paymentSchema>;

/** Category create schema. */
export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(""),
});
export type CategoryInput = z.infer<typeof categorySchema>;

/** Site settings update schema. */
export const siteSettingsSchema = z.object({
  site_name: z.string().min(1).max(100),
  site_description: z.string().max(500).optional().default(""),
  allow_registration: z.boolean().default(true),
  hero_title: z.string().max(200).optional().default(""),
  hero_subtitle: z.string().max(500).optional().default(""),
  social_links: z.record(z.string()).optional().default({}),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

/** Search query params schema. */
export const searchParamsSchema = z.object({
  q: z.string().optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  cat1: z.string().optional().default(""),
  cat2: z.string().optional().default(""),
  tag: z.string().optional().default(""),
  author: z.string().optional().default(""),
});
export type SearchParams = z.infer<typeof searchParamsSchema>;
