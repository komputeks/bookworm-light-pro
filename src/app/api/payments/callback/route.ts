/** Lipia M-Pesa callback webhook — receives payment status updates. */
import { parseCallbackPayload } from "@services/lipia";
import { createServerClient } from "@lib/supabase";
import { log } from "@lib/errors";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = parseCallbackPayload(body);

    if (!payload) {
      log({ level: "warn", message: "Invalid payment callback payload" });
      return new Response("ok", { status: 200 });
    }

    const supabase = createServerClient();

    // Find the transaction by reference and update (idempotent — only update if not already success)
    const { data: existing } = await supabase
      .from("bookworm_payment_transactions")
      .select("*")
      .eq("reference", payload.reference)
      .single();

    if (existing && existing.status !== "success") {
      await supabase
        .from("bookworm_payment_transactions")
        .update({
          status: payload.status,
          receipt_number: payload.receipt,
          updated_at: new Date().toISOString(),
        })
        .eq("reference", payload.reference);
    }

    log({ level: "info", message: "Payment callback processed", context: { reference: payload.reference, status: payload.status } });
    return new Response("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
  } catch (e: any) {
    log({ level: "error", message: "POST /api/payments/callback failed", error: e });
    return new Response("ok", { status: 200 });
  }
}
