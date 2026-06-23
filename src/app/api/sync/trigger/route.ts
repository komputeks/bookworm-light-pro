/**
 * Trigger a manual sync (Sheets → Supabase) for the authenticated user.
 * This is the on-demand "Sync Now" button endpoint.
 */
import { createServerClient } from "@lib/supabase";
import { pullPostsFromSheet } from "@services/sheets-sync";
import { log, logAudit } from "@lib/errors";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("bookworm_profiles").select("*").eq("user_id", user.id).single();
    if (!profile?.sheet_id || !profile?.sheet_initialized) {
      return Response.json({ success: false, error: "Sheet not initialized" }, { status: 400 });
    }

    // Pull all rows from the sheet
    const { posts: sheetPosts, error: pullError } = await pullPostsFromSheet(profile.sheet_id);
    if (pullError) {
      log({ level: "error", message: "Sync pull failed", context: { userId: user.id }, error: pullError });
    }

    let rowsPulled = 0;
    let rowsPushed = 0;

    // For each sheet row, find the matching Supabase post and update if sheet is newer
    for (const sheetPost of sheetPosts) {
      if (!sheetPost.post_id || sheetPost.post_id === "sample-post-id") continue;

      const { data: dbPost } = await supabase.from("bookworm_posts").select("*").eq("id", sheetPost.post_id).single();

      if (dbPost) {
        // Compare timestamps — only update author-editable fields if sheet is newer
        const sheetModified = sheetPost.last_modified ? new Date(sheetPost.last_modified).getTime() : 0;
        const dbModified = dbPost.sheet_updated_at ? new Date(dbPost.sheet_updated_at).getTime() : 0;

        if (sheetModified > dbModified) {
          // Sheet is newer — update Supabase with author-editable columns only
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
          }).eq("id", sheetPost.post_id).eq("author_id", user.id);
          rowsPulled++;
        }
      }
      rowsPushed++;
    }

    // Log the sync operation
    await supabase.from("bookworm_sync_log").insert({
      user_id: user.id,
      direction: "sheets_to_supabase",
      trigger: "on_demand",
      rows_pushed: rowsPushed,
      rows_pulled: rowsPulled,
      status: pullError ? "partial" : "success",
      error: pullError ?? null,
    });

    await logAudit(user.id, "sync_sheets_to_supabase", "sync", null, { rowsPulled, rowsPushed });
    return Response.json({ success: true, rowsPulled, rowsPushed });
  } catch (e: any) {
    log({ level: "error", message: "POST /api/sync/trigger failed", error: e });
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
