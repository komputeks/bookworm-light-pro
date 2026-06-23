/** Save/update a post — writes to Supabase first, then replicates to Google Sheets. */
import { createServerClient } from "@lib/supabase";
import { pushPostToSheet } from "@services/sheets-sync";
import { log, logAudit } from "@lib/errors";
import { slugify } from "@lib/utils";
import type { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createServerClient();

    // Verify the user is authenticated
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile to check sheet_id
    const { data: profile } = await supabase
      .from("bookworm_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const slug = slugify(body.title) ?? `post-${Date.now()}`;
    const now = new Date().toISOString();

    if (body.id) {
      // Update existing post
      const { data: post, error } = await supabase
        .from("bookworm_posts")
        .update({
          title: body.title,
          cat1: body.cat1,
          cat2: body.cat2,
          slug,
          excerpt: body.excerpt || null,
          content_md: body.content_md,
          tags: body.tags,
          status: body.status,
          featured_image: body.featured_image || null,
          updated_at: now,
          sheet_updated_at: now,
        })
        .eq("id", body.id)
        .eq("author_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Replicate to Google Sheets
      if (profile?.sheet_id && profile?.sheet_initialized) {
        const rowId = await pushPostToSheet(profile.sheet_id, post);
        if (rowId && rowId !== post.sheet_row_id) {
          await supabase.from("bookworm_posts").update({ sheet_row_id: rowId }).eq("id", post.id);
        }
      }

      await logAudit(user.id, "update_post", "post", post.id, { title: body.title });
      return Response.json({ success: true, post });
    } else {
      // Create new post
      const { data: post, error } = await supabase
        .from("bookworm_posts")
        .insert({
          author_id: user.id,
          title: body.title,
          cat1: body.cat1,
          cat2: body.cat2,
          slug,
          excerpt: body.excerpt || null,
          content_md: body.content_md,
          tags: body.tags,
          status: body.status,
          featured_image: body.featured_image || null,
          likes: 0,
          view_count: 0,
          sheet_row_id: null,
          created_at: now,
          updated_at: now,
          sheet_updated_at: now,
        })
        .select()
        .single();

      if (error) throw error;

      // Replicate to Google Sheets
      if (profile?.sheet_id && profile?.sheet_initialized) {
        const rowId = await pushPostToSheet(profile.sheet_id, post);
        if (rowId) {
          await supabase.from("bookworm_posts").update({ sheet_row_id: rowId }).eq("id", post.id);
        }
      }

      await logAudit(user.id, "create_post", "post", post.id, { title: body.title });
      return Response.json({ success: true, post });
    }
  } catch (e: any) {
    log({ level: "error", message: "POST /api/posts/save failed", error: e });
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
