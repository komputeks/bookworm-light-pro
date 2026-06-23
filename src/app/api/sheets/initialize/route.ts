/** Initialize a user's Google Sheet — verify access, rename, write headers. */
import { createServerClient } from "@lib/supabase";
import { initializeSheet } from "@services/sheets-sync";
import { siteConfig } from "@config";
import { log, logAudit } from "@lib/errors";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sheet_id } = await req.json();
    const supabase = createServerClient();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("bookworm_profiles").select("*").eq("user_id", user.id).single();
    if (!profile) return Response.json({ success: false, error: "Profile not found" }, { status: 404 });

    const result = await initializeSheet(sheet_id, profile.username, siteConfig.name);
    if (!result.success) {
      return Response.json({ success: false, error: result.error });
    }

    // Update profile with sheet_id and sheet_initialized = true
    await supabase.from("bookworm_profiles").update({
      sheet_id,
      sheet_initialized: true,
    }).eq("user_id", user.id);

    await logAudit(user.id, "initialize_sheet", "profile", user.id, { sheet_id });
    return Response.json({ success: true });
  } catch (e: any) {
    log({ level: "error", message: "POST /api/sheets/initialize failed", error: e });
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
