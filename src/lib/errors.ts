/**
 * Centralized error handling — typed errors, structured logging, no secrets leaked.
 * All errors are logged and surfaced to the admin dashboard via bookworm_audit_logs.
 */
import { createServerClient } from "./supabase";

/** Custom error class with typed codes for predictable handling. */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "INTERNAL_ERROR",
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** Common error factories. */
export const errors = {
  unauthorized: (msg = "Unauthorized") => new AppError(msg, "UNAUTHORIZED", 401),
  forbidden: (msg = "Forbidden") => new AppError(msg, "FORBIDDEN", 403),
  notFound: (msg = "Not found") => new AppError(msg, "NOT_FOUND", 404),
  badRequest: (msg = "Bad request") => new AppError(msg, "BAD_REQUEST", 400),
  conflict: (msg = "Conflict") => new AppError(msg, "CONFLICT", 409),
};

/** Structured log entry — never logs secrets, tokens, or passwords. */
interface LogEntry {
  level: "info" | "warn" | "error";
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
}

/** Sanitize context to remove sensitive fields before logging. */
const SENSITIVE_KEYS = ["password", "token", "secret", "key", "authorization", "cookie"];
function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s))) {
      cleaned[k] = "[REDACTED]";
    } else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      cleaned[k] = sanitize(v as Record<string, unknown>);
    } else {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

/** Centralized logger — outputs structured JSON to console (captured by Vercel). */
export function log(entry: LogEntry): void {
  const sanitized = entry.context ? sanitize(entry.context) : {};
  const output = {
    level: entry.level,
    message: entry.message,
    timestamp: new Date().toISOString(),
    ...sanitized,
    ...(entry.error instanceof Error
      ? { error: entry.error.message, stack: entry.error.stack }
      : entry.error
        ? { error: String(entry.error) }
        : {}),
  };
  if (entry.level === "error") console.error(JSON.stringify(output));
  else if (entry.level === "warn") console.warn(JSON.stringify(output));
  else console.log(JSON.stringify(output));
}

/** Log an error to the audit_logs table for admin observability. */
export async function logAudit(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string | null = null,
  details: Record<string, unknown> = {}
): Promise<void> {
  try {
    const supabase = createServerClient();
    await supabase.from("bookworm_audit_logs").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: sanitize(details),
    });
  } catch (e) {
    log({ level: "error", message: "Failed to write audit log", context: { action, entityType }, error: e });
  }
}

/** Retry an async operation with exponential backoff. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        log({ level: "warn", message: `Retry attempt ${attempt + 1}/${maxRetries}`, context: { delay }, error: e });
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}
