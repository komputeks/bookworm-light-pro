"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@providers";
import { getBrowserClient } from "@lib/supabase";
import { slugify } from "@lib/utils";
import type { Post, PostStatus } from "@types";

function PostEditorInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [cat1, setCat1] = useState("");
  const [cat2, setCat2] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<PostStatus>("draft");
  const [featuredImage, setFeaturedImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(!!editId);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (editId && user) loadPost();
  }, [editId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPost = async () => {
    const supabase = getBrowserClient();
    const { data } = await supabase.from("bookworm_posts").select("*").eq("id", editId).single();
    if (data) {
      const p = data as Post;
      setTitle(p.title); setCat1(p.cat1); setCat2(p.cat2); setExcerpt(p.excerpt ?? "");
      setContent(p.content_md); setTags(p.tags.join(", ")); setStatus(p.status); setFeaturedImage(p.featured_image ?? "");
    }
    setLoadingPost(false);
  };

  const handleSave = async (publishStatus?: PostStatus) => {
    setError(null);
    if (!title.trim() || !cat1.trim() || !cat2.trim() || !content.trim()) {
      setError("Title, category 1, category 2, and content are required.");
      return;
    }
    setSaving(true);
    const slug = slugify(title) ?? `post-${Date.now()}`;
    const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const finalStatus = publishStatus ?? status;

    const res = await fetch("/api/posts/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editId,
        title, cat1, cat2, slug, excerpt, content_md: content,
        tags: tagArray, status: finalStatus, featured_image: featuredImage,
      }),
    });
    const data = await res.json();
    if (data.success) {
      router.push("/dashboard");
    } else {
      setError(data.error ?? "Failed to save post");
    }
    setSaving(false);
  };

  if (loading || loadingPost) return <div className="section"><div className="container-book"><div className="skeleton h-96 w-full" /></div></div>;
  if (!user) return null;

  return (
    <div className="section">
      <div className="container-book">
        <h1 className="mb-6 text-3xl font-bold text-text-dark dark:text-white">{editId ? "Edit Post" : "New Post"}</h1>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input text-lg" placeholder="Your post title" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Category 1 (e.g. technology)</label>
              <input type="text" value={cat1} onChange={(e) => setCat1(e.target.value.toLowerCase().replace(/\s+/g, "-"))} className="input" placeholder="technology" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Category 2 (e.g. web-dev)</label>
              <input type="text" value={cat2} onChange={(e) => setCat2(e.target.value.toLowerCase().replace(/\s+/g, "-"))} className="input" placeholder="web-development" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Excerpt (optional)</label>
            <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="input" placeholder="Short summary of your post" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Featured Image URL (optional)</label>
            <input type="url" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} className="input" placeholder="https://images.pexels.com/..." />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Tags (comma-separated)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="input" placeholder="tutorial, beginner, nextjs" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Content (Markdown)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={20} className="input font-mono text-sm" placeholder="# My Post

Write your markdown here..." />
          </div>

          <div className="flex gap-2">
            <button onClick={() => handleSave("draft")} disabled={saving} className="btn btn-outline">Save Draft</button>
            <button onClick={() => handleSave("published")} disabled={saving} className="btn btn-primary">
              {saving ? "Saving..." : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostEditorPage() {
  return (
    <Suspense fallback={<div className="section"><div className="container-book"><div className="skeleton h-96 w-full" /></div></div>}>
      <PostEditorInner />
    </Suspense>
  );
}
