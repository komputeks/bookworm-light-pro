"use client";
import { useState, useEffect } from "react";
import { getBrowserClient } from "@lib/supabase";
import type { PaymentTransaction } from "@types";

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);
  const fetchPayments = async () => {
    const supabase = getBrowserClient();
    const { data } = await supabase.from("bookworm_payment_transactions").select("*").order("created_at", { ascending: false });
    setPayments((data as PaymentTransaction[]) ?? []);
    setLoading(false);
  };

  if (loading) return <div className="skeleton h-96 w-full" />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-dark dark:text-white">Payments ({payments.length})</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-theme-light dark:bg-gray-800"><tr><th className="p-3 text-left">Reference</th><th className="p-3 text-left">Phone</th><th className="p-3 text-left">Amount</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Receipt</th><th className="p-3 text-left">Date</th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-border dark:border-gray-700">
                <td className="p-3 font-mono text-xs text-text-dark dark:text-white">{p.reference}</td>
                <td className="p-3 text-text">{p.phone_number}</td>
                <td className="p-3 font-semibold text-text-dark dark:text-white">KSh {p.amount}</td>
                <td className="p-3"><span className={`badge ${p.status === "success" ? "badge-primary" : p.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{p.status}</span></td>
                <td className="p-3 text-text">{p.receipt_number ?? ""}</td>
                <td className="p-3 text-xs text-text">{new Date(p.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
