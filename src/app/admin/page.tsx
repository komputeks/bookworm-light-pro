"use client";
import { useState, useEffect } from "react";
import { getBrowserClient } from "@lib/supabase";
import type { Post, Profile, SyncLog, PaymentTransaction } from "@types";
import { FaUsers, FaFileAlt, FaSync, FaMoneyBill, FaEye, FaHeart } from "react-icons/fa";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, posts: 0, syncLogs: 0, payments: 0, totalViews: 0, totalLikes: 0 });
  const [recentLogs, setRecentLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    const supabase = getBrowserClient();
    const [users, posts, logs, payments] = await Promise.all([
      supabase.from("bookworm_profiles").select("*", { count: "exact", head: true }),
      supabase.from("bookworm_posts").select("*", { count: "exact", head: true }),
      supabase.from("bookworm_sync_log").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("bookworm_payment_transactions").select("*", { count: "exact", head: true }),
    ]);
    // Also get total views and likes
    const { data: allPosts } = await supabase.from("bookworm_posts").select("view_count, likes");
    const totalViews = (allPosts ?? []).reduce((s, p) => s + (p as any).view_count, 0);
    const totalLikes = (allPosts ?? []).reduce((s, p) => s + (p as any).likes, 0);

    setStats({
      users: users.count ?? 0,
      posts: posts.count ?? 0,
      syncLogs: logs.count ?? 0,
      payments: payments.count ?? 0,
      totalViews,
      totalLikes,
    });
    setRecentLogs((logs.data as SyncLog[]) ?? []);
    setLoading(false);
  };

  if (loading) return <div className="skeleton h-96 w-full" />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-dark dark:text-white">Dashboard Overview</h1>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={FaUsers} label="Users" value={stats.users} color="text-blue-500" />
        <StatCard icon={FaFileAlt} label="Posts" value={stats.posts} color="text-green-500" />
        <StatCard icon={FaSync} label="Sync Operations" value={stats.syncLogs} color="text-purple-500" />
        <StatCard icon={FaEye} label="Total Views" value={stats.totalViews} color="text-orange-500" />
        <StatCard icon={FaHeart} label="Total Likes" value={stats.totalLikes} color="text-red-500" />
        <StatCard icon={FaMoneyBill} label="Payments" value={stats.payments} color="text-yellow-500" />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-border p-4 dark:border-gray-700"><h2 className="font-bold text-text-dark dark:text-white">Recent Sync Logs</h2></div>
        {recentLogs.length === 0 ? (
          <p className="p-4 text-text">No sync activity yet.</p>
        ) : (
          <div className="divide-y divide-border dark:divide-gray-700">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 text-sm">
                <div><span className="font-semibold text-text-dark dark:text-white">{log.direction}</span> <span className="text-text">via {log.trigger}</span></div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${log.status === "success" ? "badge-primary" : log.status === "partial" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{log.status}</span>
                  <span className="text-xs text-text">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="card p-4">
      <Icon className={`mb-2 text-2xl ${color}`} />
      <p className="text-2xl font-bold text-text-dark dark:text-white">{value}</p>
      <p className="text-sm text-text">{label}</p>
    </div>
  );
}
