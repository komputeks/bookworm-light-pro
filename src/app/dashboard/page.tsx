"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@providers";
import { getBrowserClient } from "@lib/supabase";
import { siteConfig, isSheetsConfigured } from "@config";
import { extractSheetId } from "@services/sheets-utils";
import type { Post, SyncLog } from "@types";
import Link from "next/link";
import { FaPlus, FaSync, FaTable, FaChartBar, FaFileAlt } from "react-icons/fa";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0, totalViews: 0, totalComments: 0 });
  const [sheetUrl, setSheetUrl] = useState("");
  const [initLoading, setInitLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [initSuccess, setInitSuccess] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    const supabase = getBrowserClient();
    const [{ data: postData }, { data: logData }] = await Promise.all([
      supabase.from("bookworm_posts").select("*").eq("author_id", user?.id).order("created_at", { ascending: false }),
      supabase.from("bookworm_sync_log").select("*").eq("user_id", user?.id).order("created_at", { ascending: false }).limit(5),
    ]);
    setPosts((postData as Post[]) ?? []);
    setSyncLogs((logData as SyncLog[]) ?? []);

    const totalLikes = (postData ?? []).reduce((sum, p) => sum + (p as any).likes, 0);
    const totalViews = (postData ?? []).reduce((sum, p) => sum + (p as any).view_count, 0);
    setStats({ totalPosts: postData?.length ?? 0, totalLikes, totalViews, totalComments: 0 });
  };

  const handleInitSheet = async () => {
    setInitLoading(true);
    setInitError(null);
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      setInitError("Invalid Google Sheets URL. Make sure you copied the full URL from your spreadsheet.");
      setInitLoading(false);
      return;
    }
    const res = await fetch("/api/sheets/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheet_id: sheetId }),
    });
    const data = await res.json();
    if (data.success) {
      setInitSuccess(true);
      // Refresh profile
      window.location.reload();
    } else {
      setInitError(data.error ?? "Failed to initialize sheet");
    }
    setInitLoading(false);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    await fetch("/api/sync/trigger", { method: "POST" });
    setSyncing(false);
    fetchData();
  };

  if (loading) return <div className="section"><div className="container-book"><div className="skeleton h-96 w-full" /></div></div>;
  if (!user) return null;

  return (
    <div className="section">
      <div className="container-wide">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-dark dark:text-white">Dashboard</h1>
          <div className="flex gap-2">
            {profile?.sheet_initialized && (
              <button onClick={handleSyncNow} disabled={syncing} className="btn btn-outline text-sm">
                <FaSync className={`mr-1 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Syncing..." : "Sync Now"}
              </button>
            )}
            <Link href="/dashboard/editor" className="btn btn-primary text-sm">
              <FaPlus className="mr-1" /> New Post
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="card p-4">
            <FaFileAlt className="mb-2 text-primary" />
            <p className="text-2xl font-bold text-text-dark dark:text-white">{stats.totalPosts}</p>
            <p className="text-sm text-text">Posts</p>
          </div>
          <div className="card p-4">
            <FaChartBar className="mb-2 text-primary" />
            <p className="text-2xl font-bold text-text-dark dark:text-white">{stats.totalLikes}</p>
            <p className="text-sm text-text">Total Likes</p>
          </div>
          <div className="card p-4">
            <FaChartBar className="mb-2 text-primary" />
            <p className="text-2xl font-bold text-text-dark dark:text-white">{stats.totalViews}</p>
            <p className="text-sm text-text">Total Views</p>
          </div>
          <div className="card p-4">
            <FaChartBar className="mb-2 text-primary" />
            <p className="text-2xl font-bold text-text-dark dark:text-white">{stats.totalComments}</p>
            <p className="text-sm text-text">Comments</p>
          </div>
        </div>

        {/* Sheet setup or status */}
        {!profile?.sheet_initialized && isSheetsConfigured ? (
          <div className="mb-8 card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-text-dark dark:text-white">
              <FaTable className="text-primary" /> Set Up Google Sheets Sync
            </h2>
            <ol className="mb-4 list-decimal space-y-2 pl-6 text-sm text-text">
              <li>Create a new, empty <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-primary underline">Google Spreadsheet</a>.</li>
              <li>Share it with this email as <strong>Editor</strong>:
                <code className="ml-2 rounded bg-theme-light px-2 py-1 text-xs dark:bg-gray-700">{siteConfig.serviceAccountEmail}</code>
              </li>
              <li>Copy the spreadsheet URL and paste it below.</li>
              <li>Click "Initialize Sheet" — we'll rename it and set up the columns automatically.</li>
            </ol>
            <div className="flex gap-2">
              <input type="text" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)}
                className="input" placeholder="https://docs.google.com/spreadsheets/d/..." />
              <button onClick={handleInitSheet} disabled={initLoading || !sheetUrl} className="btn btn-primary whitespace-nowrap">
                {initLoading ? "Initializing..." : "Initialize Sheet"}
              </button>
            </div>
            {initError && <p className="mt-2 text-sm text-red-500">{initError}</p>}
            {initSuccess && <p className="mt-2 text-sm text-green-500">Sheet initialized! You can now sync posts.</p>}
          </div>
        ) : profile?.sheet_id ? (
          <div className="mb-8 card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FaTable className="text-green-500" />
              <div>
                <p className="font-semibold text-text-dark dark:text-white">Sheets sync active</p>
                <a href={`https://docs.google.com/spreadsheets/d/${profile.sheet_id}`} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Open your spreadsheet →</a>
              </div>
            </div>
          </div>
        ) : null}

        {/* Posts table */}
        <div className="card overflow-hidden">
          <div className="border-b border-border p-4 dark:border-gray-700">
            <h2 className="font-bold text-text-dark dark:text-white">Your Posts</h2>
          </div>
          {posts.length === 0 ? (
            <div className="p-8 text-center text-text">
              <p className="mb-2">No posts yet.</p>
              <Link href="/dashboard/editor" className="btn btn-primary text-sm">Write your first post</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-theme-light dark:bg-gray-800">
                  <tr>
                    <th className="p-3 text-left font-semibold text-text-dark dark:text-white">Title</th>
                    <th className="p-3 text-left font-semibold text-text-dark dark:text-white">Category</th>
                    <th className="p-3 text-left font-semibold text-text-dark dark:text-white">Status</th>
                    <th className="p-3 text-left font-semibold text-text-dark dark:text-white">Likes</th>
                    <th className="p-3 text-left font-semibold text-text-dark dark:text-white">Views</th>
                    <th className="p-3 text-left font-semibold text-text-dark dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-t border-border dark:border-gray-700">
                      <td className="p-3">
                        <Link href={`/blog/${post.cat1}/${post.cat2}/${post.slug}`} className="font-semibold text-text-dark hover:text-primary dark:text-white">{post.title}</Link>
                      </td>
                      <td className="p-3 text-text">{post.cat1}/{post.cat2}</td>
                      <td className="p-3">
                        <span className={`badge ${post.status === "published" ? "badge-primary" : "bg-gray-200 text-gray-600"}`}>{post.status}</span>
                      </td>
                      <td className="p-3 text-text">{post.likes}</td>
                      <td className="p-3 text-text">{post.view_count}</td>
                      <td className="p-3">
                        <Link href={`/dashboard/editor?id=${post.id}`} className="text-primary hover:underline">Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent sync logs */}
        {syncLogs.length > 0 && (
          <div className="mt-8 card overflow-hidden">
            <div className="border-b border-border p-4 dark:border-gray-700">
              <h2 className="font-bold text-text-dark dark:text-white">Recent Sync Activity</h2>
            </div>
            <div className="divide-y divide-border dark:divide-gray-700">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <span className="font-semibold text-text-dark dark:text-white">{log.direction}</span>
                    <span className="ml-2 text-text">via {log.trigger}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${log.status === "success" ? "badge-primary" : log.status === "partial" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{log.status}</span>
                    <span className="text-xs text-text">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
