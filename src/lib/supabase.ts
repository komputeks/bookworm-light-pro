/**
 * Supabase client utilities.
 * - `createServerClient`: service-role client for server actions / route handlers (bypasses RLS).
 * - `createBrowserClient`: anon-key client for client components (respects RLS).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@config/env";

/**
 * Server-side Supabase client using the service role secret.
 * Bypasses RLS — use ONLY in server actions, route handlers, and server components.
 * Never expose this client or its keys to the browser.
 */
export function createServerClient(): SupabaseClient {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_SECRET,
    { auth: { persistSession: false } }
  );
}

/**
 * Browser-side Supabase client using the publishable (anon) key.
 * Respects RLS policies. Used in client components for auth and public reads.
 */
export function createBrowserClient(): SupabaseClient {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: true, autoRefreshToken: true } }
  );
}

/** Singleton browser client — avoids recreating on every render. */
let browserClient: SupabaseClient | null = null;
export function getBrowserClient(): SupabaseClient {
  if (!browserClient) browserClient = createBrowserClient();
  return browserClient;
}
