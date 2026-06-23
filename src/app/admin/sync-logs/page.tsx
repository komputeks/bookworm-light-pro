"use client";
import { useState, useEffect } from "react";
import { getBrowserClient } from "@lib/supabase";
import type { SyncLog } from "@types";

export default function AdminSyncLogs() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);
  const fetchLogs = async () => {
    const supabase = getBrowserClient();
    const { data } = await supabase.from("bookworm_sync_log").select("*").order("created_at", { ascending: false }).limit(100);
    setLogs((data as SyncLog[]) ?? []);
    setLoading(false);
  };

  if (loading) return <div className="skeleton h-96 w-full" />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-dark dark:text-white">Sync Logs ({logs.length})</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-theme-light dark:bg-gray-800"><tr><th className="p-3 text-left">Direction</th><th className="p-3 text-left">Trigger</th><th className="p-3 text-left">Rows Pushed</th><th className="p-3 text-left">Rows Pulled</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Error</th><th className="p-3 text-left">Time</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-border dark:border-gray-700">
                <td className="p-3 font-semibold text-text-dark dark:text-white">{log.direction}</td>
                <td className="p-3 text-text">{log.trigger}</td>
                <td className="p-3 text-text">{log.rows_pushed}</td>
                <td className="p-3 text-text">{log.rows_pulled}</td>
                <td className="p-3"><span className={`badge ${log.status === "success" ? "badge-primary" : log.status === "partial" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{log.status}</span></td>
                <td className="p-3 text-xs text-red-500">{log.error ?? ""}</td>
                <td className="p-3 text-xs text-text">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
