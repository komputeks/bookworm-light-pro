/**
 * Sync cron endpoint — called by GitHub Actions every 10 min and by Drive Push Notifications.
 * Authenticated via SYNC_WORKER_SECRET header.
 * Syncs all users with initialized sheets.
 */
import { createServerClient } from "@lib/supabase";
import { pullPostsFromSheet } from "@services/sheets-sync";
import { env } from "@config/env";
import { log } from "@lib/errors";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Verify the shared secret
    const secret = req.headers.get("x-sync-secret");
    if (secret !== env.SYNC_WORKER_SECRET) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();

    // Get all users with initialized sheets
    const { data: profiles } = await supabase
      .from("bookworm_profiles")
      .select("*")
      .eq("sheet_initialized", true)
      .not("sheet_id", "is", null);

    let totalSynced = 0;
    let totalErrors = 0;

    for (const profile of profiles ?? []) {
      try {
        const { posts: sheetPosts, error: pullError } = await pullPostsFromSheet(profile.sheet_id!);
        if (pullError) {
          totalErrors++;
          log({ level: "warn", message: "Sync error for user", context: { userId: profile.user_id }, error: pullError });
          continue;
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
          trigger: "cron",
          rows_pushed: sheetPosts.length,
          rows_pulled: rowsPulled,
          status: "success",
          error: null,
        });
        totalSynced++;
      } catch (e) {
        totalErrors++;
        log({ level: "error", message: "Sync failed for profile", context: { userId: profile.user_id }, error: e });
      }
    }

    log({ level: "info", message: "Cron sync complete", context: { totalSynced, totalErrors } });
    return Response.json({ success: true, totalSynced, totalErrors });
  } catch (e: any) {
    log({ level: "error", message: "POST /api/sync/cron failed", error: e });
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
