/** Delete a post — removes from Supabase and clears the sheet row. */
import { createServerClient } from "@lib/supabase";
import { deletePostFromSheet } from "@services/sheets-sync";
import { log, logAudit } from "@lib/errors";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const supabase = createServerClient();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

    // Get the post to find sheet_row_id
    const { data: post } = await supabase.from("bookworm_posts").select("*").eq("id", id).eq("author_id", user.id).single();
    if (!post) return Response.json({ success: false, error: "Post not found" }, { status: 404 });

    // Get profile for sheet_id
    const { data: profile } = await supabase.from("bookworm_profiles").select("sheet_id, sheet_initialized").eq("user_id", user.id).single();

    // Delete from Supabase
    const { error } = await supabase.from("bookworm_posts").delete().eq("id", id).eq("author_id", user.id);
    if (error) throw error;

    // Clear from sheet
    if (profile?.sheet_id && profile?.sheet_initialized && post.sheet_row_id) {
      await deletePostFromSheet(profile.sheet_id, post.sheet_row_id);
    }

    await logAudit(user.id, "delete_post", "post", id);
    return Response.json({ success: true });
  } catch (e: any) {
    log({ level: "error", message: "POST /api/posts/delete failed", error: e });
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
