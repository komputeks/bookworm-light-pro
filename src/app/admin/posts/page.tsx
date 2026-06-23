"use client";
import { useState, useEffect } from "react";
import { getBrowserClient } from "@lib/supabase";
import type { Post } from "@types";
import Link from "next/link";

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPosts(); }, []);
  const fetchPosts = async () => {
    const supabase = getBrowserClient();
    const { data } = await supabase.from("bookworm_posts").select("*").order("created_at", { ascending: false });
    setPosts((data as Post[]) ?? []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const supabase = getBrowserClient();
    await supabase.from("bookworm_posts").delete().eq("id", id);
    fetchPosts();
  };

  if (loading) return <div className="skeleton h-96 w-full" />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-dark dark:text-white">All Posts ({posts.length})</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-theme-light dark:bg-gray-800">
            <tr><th className="p-3 text-left">Title</th><th className="p-3 text-left">Author</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Likes</th><th className="p-3 text-left">Views</th><th className="p-3 text-left">Actions</th></tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-border dark:border-gray-700">
                <td className="p-3"><Link href={`/blog/${post.cat1}/${post.cat2}/${post.slug}`} className="font-semibold text-text-dark hover:text-primary dark:text-white">{post.title}</Link></td>
                <td className="p-3 text-text">{post.author_id.slice(0, 8)}</td>
                <td className="p-3"><span className="badge badge-primary">{post.status}</span></td>
                <td className="p-3 text-text">{post.likes}</td>
                <td className="p-3 text-text">{post.view_count}</td>
                <td className="p-3"><button onClick={() => handleDelete(post.id)} className="text-red-500 hover:underline">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
