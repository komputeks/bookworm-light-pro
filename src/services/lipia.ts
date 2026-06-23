/**
 * Lipia M-Pesa payment service.
 * Base URL: https://lipia-api.kreativelabske.com/api/v2
 * Endpoints: POST /payments/stk-push, GET /payments/status, POST callback webhook.
 */
import { env, isPaymentsConfigured } from "@config/env";
import { log, withRetry } from "@lib/errors";

/** Initiate an STK Push payment request. */
export async function initiateStkPush(params: {
  phone_number: string;
  amount: number;
  external_reference?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; reference?: string; error?: string }> {
  if (!isPaymentsConfigured) {
    return { success: false, error: "Payments are not configured." };
  }
  try {
    const res = await withRetry(() =>
      fetch(`${env.LIPIA_BASE_URL}/payments/stk-push`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.LIPIA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
    );
    const data = await res.json();
    if (data.success) {
      return { success: true, reference: data.data?.TransactionReference };
    }
    return { success: false, error: data.customerMessage ?? data.message ?? "Payment initiation failed" };
  } catch (e: any) {
    log({ level: "error", message: "STK Push failed", context: { phone: params.phone_number, amount: params.amount }, error: e });
    return { success: false, error: e.message ?? "Network error during payment initiation" };
  }
}

/** Check the status of a transaction by reference. */
export async function checkTransactionStatus(
  reference: string
): Promise<{ status: "pending" | "success" | "failed"; receipt?: string; error?: string }> {
  if (!isPaymentsConfigured) {
    return { status: "failed", error: "Payments are not configured." };
  }
  try {
    const res = await fetch(
      `${env.LIPIA_BASE_URL}/payments/status?reference=${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${env.LIPIA_API_KEY}` } }
    );
    const data = await res.json();
    if (data.success) {
      const status = String(data.data?.response?.Status ?? "").toLowerCase();
      if (status === "success") return { status: "success", receipt: data.data.response.MpesaReceiptNumber };
      if (status === "failed") return { status: "failed" };
      return { status: "pending" };
    }
    return { status: "failed", error: data.message ?? "Status check failed" };
  } catch (e: any) {
    log({ level: "error", message: "Transaction status check failed", context: { reference }, error: e });
    return { status: "failed", error: e.message };
  }
}

/** Parse the Lipia callback webhook payload. */
export function parseCallbackPayload(body: any): {
  status: "success" | "failed";
  reference: string;
  receipt: string | null;
  amount: number;
  phone: string;
  externalReference: string | null;
} | null {
  try {
    const response = body?.response ?? body;
    const status = String(response?.Status ?? "").toLowerCase();
    return {
      status: status === "success" ? "success" : "failed",
      reference: String(response?.CheckoutRequestID ?? response?.MerchantRequestID ?? ""),
      receipt: response?.MpesaReceiptNumber || null,
      amount: Number(response?.Amount ?? 0),
      phone: String(response?.Phone ?? ""),
      externalReference: response?.ExternalReference ?? null,
    };
  } catch {
    return null;
  }
}
