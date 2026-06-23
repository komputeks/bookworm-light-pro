import { z } from "zod";

/**
 * Centralized environment variable schema.
 * All env vars are validated at startup with Zod — no runtime surprises.
 * Private secrets (no NEXT_PUBLIC_ prefix) are never exposed to the client.
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_SECRET: z.string().min(1),

  // Google OAuth (end-user sign-in)
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),

  // Google Service Account (Sheets + Drive — server-side only)
  GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL: z.string().optional().default(""),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().optional().default(""),

  // Resend (email — deferred)
  RESEND_API_KEY: z.string().optional().default(""),

  // Lipia M-Pesa
  LIPIA_API_KEY: z.string().optional().default(""),
  LIPIA_BASE_URL: z.string().url().optional().default("https://lipia-api.kreativelabske.com/api/v2"),

  // Sync worker
  SYNC_WORKER_SECRET: z.string().optional().default(""),

  // Site
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_NAME: z.string().optional().default("Bookworm Light Pro"),

  // GitHub (server-side only)
  GITHUB_PAT: z.string().optional().default(""),
  GITHUB_USERNAME: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

/** Parsed and validated environment variables. */
export const env = envSchema.parse(process.env);

/** Whether the Google Sheets sync feature is fully configured. */
export const isSheetsConfigured = Boolean(
  env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
);

/** Whether email sending is configured (Resend). */
export const isEmailConfigured = Boolean(env.RESEND_API_KEY);

/** Whether Lipia payments are configured. */
export const isPaymentsConfigured = Boolean(env.LIPIA_API_KEY);
