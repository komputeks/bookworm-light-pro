/**
 * Email service — Resend SMTP (deferred, key currently invalid).
 * When the key is invalid, all email operations gracefully return a 'not configured' status.
 */
import { env, isEmailConfigured } from "@config/env";
import { log } from "@lib/errors";

/** Send an email via Resend. Returns success=false if not configured. */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isEmailConfigured) {
    log({ level: "warn", message: "Email not sent — Resend not configured", context: { to: params.to, subject: params.subject } });
    return { success: false, error: "Email service is not configured. Set RESEND_API_KEY to enable email sending." };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: params.from ?? "Bookworm Light Pro <noreply@bookworm.pro>",
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });
    const data = await res.json();
    if (res.ok) return { success: true };
    return { success: false, error: data.message ?? "Failed to send email" };
  } catch (e: any) {
    log({ level: "error", message: "sendEmail failed", context: { to: params.to }, error: e });
    return { success: false, error: e.message };
  }
}

/** Send a password reset email. */
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<{ success: boolean; error?: string }> {
 return sendEmail({
    to,
    subject: "Reset your password — Bookworm Light Pro",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetLink}" style="display: inline-block; background: #01AD9F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
