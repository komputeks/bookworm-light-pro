/** Core domain types for the Bookworm Light Pro platform. */

export type UserRole = "admin" | "author" | "reader";

export type PostStatus = "draft" | "published" | "archived";

/** A user profile row from the bookworm_profiles table. */
export interface Profile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole;
  sheet_id: string | null;
  sheet_initialized: boolean;
  sheet_channel_id: string | null;
  sheet_channel_expiry: string | null;
  created_at: string;
  updated_at: string;
}

/** A post row from the bookworm_posts table. */
export interface Post {
  id: string;
  author_id: string;
  cat1: string;
  cat2: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_md: string;
  tags: string[];
  likes: number;
  view_count: number;
  status: PostStatus;
  featured_image: string | null;
  sheet_row_id: number | null;
  created_at: string;
  updated_at: string;
  sheet_updated_at: string | null;
}

/** Post with author profile joined — used in list views. */
export interface PostWithAuthor extends Post {
  author: Pick<Profile, "id" | "username" | "avatar_url" | "bio"> | null;
  comment_count: number;
}

/** A comment row from the bookworm_post_comments table. */
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  author: Pick<Profile, "id" | "username" | "avatar_url"> | null;
}

/** A category row from the bookworm_categories table. */
export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  post_count: number;
}

/** A tag row from the bookworm_tags table. */
export interface Tag {
  id: string;
  slug: string;
  name: string;
  post_count: number;
}

/** A sync log entry from the bookworm_sync_log table. */
export interface SyncLog {
  id: string;
  user_id: string;
  direction: "supabase_to_sheets" | "sheets_to_supabase";
  trigger: "on_demand" | "cron" | "drive_push" | "edge_function";
  rows_pushed: number;
  rows_pulled: number;
  status: "success" | "partial" | "failed";
  error: string | null;
  created_at: string;
}

/** A payment transaction from the bookworm_payment_transactions table. */
export interface PaymentTransaction {
  id: string;
  user_id: string | null;
  reference: string;
  phone_number: string;
  amount: number;
  status: "pending" | "success" | "failed";
  receipt_number: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Audit log entry for sensitive operations. */
export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

/** Site settings from the bookworm_site_settings table. */
export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  allow_registration: boolean;
  smtp_provider: string | null;
  smtp_config: Record<string, unknown> | null;
  hero_title: string;
  hero_subtitle: string;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

/** Follow relationship between users. */
export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}
