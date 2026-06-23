/** Initiate a Lipia M-Pesa STK Push payment. */
import { initiateStkPush } from "@services/lipia";
import { createServerClient } from "@lib/supabase";
import { siteConfig } from "@config";
import { log } from "@lib/errors";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone_number, amount, external_reference, metadata } = await req.json();
    const supabase = createServerClient();

    // Get user if authenticated
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id ?? null;
    }

    const callbackUrl = `${siteConfig.url}/api/payments/callback`;
    const result = await initiateStkPush({
      phone_number,
      amount,
      external_reference: external_reference || `bookworm-${Date.now()}`,
      callback_url: callbackUrl,
      metadata,
    });

    if (result.success && result.reference) {
      // Store the pending transaction
      await supabase.from("bookworm_payment_transactions").insert({
        user_id: userId,
        reference: result.reference,
        phone_number,
        amount,
        status: "pending",
        metadata: metadata ?? null,
      });
      return Response.json({ success: true, reference: result.reference });
    }
    return Response.json({ success: false, error: result.error }, { status: 400 });
  } catch (e: any) {
    log({ level: "error", message: "POST /api/payments/initiate failed", error: e });
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
