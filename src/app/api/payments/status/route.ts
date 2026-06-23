/** Check payment status by reference. */
import { checkTransactionStatus } from "@services/lipia";
import { createServerClient } from "@lib/supabase";
import { log } from "@lib/errors";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get("reference");
    if (!reference) return Response.json({ success: false, error: "Missing reference" }, { status: 400 });

    const result = await checkTransactionStatus(reference);
    const supabase = createServerClient();

    // Update the transaction in DB
    if (result.status === "success" && result.receipt) {
      await supabase.from("bookworm_payment_transactions").update({
        status: "success",
        receipt_number: result.receipt,
        updated_at: new Date().toISOString(),
      }).eq("reference", reference);
    } else if (result.status === "failed") {
      await supabase.from("bookworm_payment_transactions").update({
        status: "failed",
        updated_at: new Date().toISOString(),
      }).eq("reference", reference);
    }

    return Response.json({ success: true, status: result.status, receipt: result.receipt });
  } catch (e: any) {
    log({ level: "error", message: "GET /api/payments/status failed", error: e });
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
