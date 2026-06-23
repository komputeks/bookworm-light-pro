import { createServerClient } from "@lib/supabase";

/** Force the Supabase schema cache to refresh by making a simple query. */
export async function refreshSchemaCache(): Promise<void> {
  const supabase = createServerClient();
  try {
    await supabase.from("bookworm_posts").select("id").limit(1);
  } catch {
    // Schema cache may not be ready — that's okay, it'll refresh on first real query
  }
}
