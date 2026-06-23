/**
 * Google Drive Push Notifications webhook.
 * Receives change signals when a user's spreadsheet is modified.
 * Triggers a sync for the affected sheet.
 */
import { createServerClient } from "@lib/supabase";
import { pullPostsFromSheet } from "@services/sheets-sync";
import { log } from "@lib/errors";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Drive Push Notifications send headers with channel info
    const channelId = req.headers.get("x-goog-channel-id") ?? "";
    const resourceId = req.headers.get("x-goog-resource-id") ?? "";
    const resourceState = req.headers.get("x-goog-resource-state") ?? "";

    log({ level: "info", message: "Drive push notification received", context: { channelId, resourceState } });

    // Only process actual changes (not sync notifications)
    if (resourceState === "sync") {
      return new Response("ok", { status: 200 });
    }

    // Find the user by channel ID (stored in sheet_channel_id)
    const supabase = createServerClient();
    const { data: profile } = await supabase
      .from("bookworm_profiles")
      .select("*")
      .eq("sheet_channel_id", channelId)
      .single();

    if (!profile?.sheet_id) {
      log({ level: "warn", message: "No profile found for channel", context: { channelId } });
      return new Response("ok", { status: 200 });
    }

    // Trigger sync for this user's sheet
    const { posts: sheetPosts, error: pullError } = await pullPostsFromSheet(profile.sheet_id);
    if (pullError) {
      log({ level: "error", message: "Drive push sync failed", context: { userId: profile.user_id }, error: pullError });
    }

    let rowsPulled = 0;
    for (const sheetPost of sheetPosts) {
      if (!sheetPost.post_id || sheetPost.post_id === "sample-post-id") continue;
      const { data: dbPost } = await supabase.from("bookworm_posts").select("*").eq("id", sheetPost.post_id).single();
      if (dbPost) {
        const sheetModified = sheetPost.last_modified ? new Date(sheetPost.last_modified).getTime() : 0;
        const dbModified = dbPost.sheet_updated_at ? new Date(dbPost.sheet_updated_at).getTime() : 0;
        if (sheetModified > dbModified) {
          await supabase.from("bookworm_posts").update({
            cat1: sheetPost.cat1 || dbPost.cat1,
            cat2: sheetPost.cat2 || dbPost.cat2,
            title: sheetPost.title || dbPost.title,
            slug: sheetPost.slug || dbPost.slug,
            excerpt: sheetPost.excerpt || dbPost.excerpt,
            content_md: sheetPost.content_md || dbPost.content_md,
            tags: sheetPost.tags?.length ? sheetPost.tags : dbPost.tags,
            status: sheetPost.status || dbPost.status,
            featured_image: sheetPost.featured_image || dbPost.featured_image,
            sheet_updated_at: new Date().toISOString(),
            sheet_row_id: sheetPost._sheet_row_id,
          }).eq("id", sheetPost.post_id);
          rowsPulled++;
        }
      }
    }

    await supabase.from("bookworm_sync_log").insert({
      user_id: profile.user_id,
      direction: "sheets_to_supabase",
      trigger: "drive_push",
      rows_pushed: sheetPosts.length,
      rows_pulled: rowsPulled,
      status: pullError ? "partial" : "success",
      error: pullError ?? null,
    });

    return new Response("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
  } catch (e: any) {
    log({ level: "error", message: "POST /api/sync/drive-webhook failed", error: e });
    return new Response("ok", { status: 200 });
  }
}
