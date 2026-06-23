"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@providers";
import { getBrowserClient } from "@lib/supabase";
import type { Comment } from "@types";
import { formatDate } from "@lib/utils";
import { FaRegComment } from "react-icons/fa";

/** Threaded comments section — Medium-style. */
export default function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, profile } = useAuth();
  const supabase = getBrowserClient();

  useEffect(() => {
    fetchComments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchComments = async () => {
    const { data } = await supabase
      .from("bookworm_post_comments")
      .select("*, author:bookworm_profiles!author_id(id, username, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setComments((data as unknown as Comment[]) ?? []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim()) return;
    setSubmitting(true);
    const { data } = await supabase
      .from("bookworm_post_comments")
      .insert({ post_id: postId, author_id: user.id, body: body.trim() })
      .select("*, author:bookworm_profiles!author_id(id, username, avatar_url)")
      .single();
    if (data) {
      setComments((prev) => [...prev, data as unknown as Comment]);
      setBody("");
    }
    setSubmitting(false);
  };

  return (
    <section className="mt-12 border-t border-border pt-8 dark:border-gray-700">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-text-dark dark:text-white">
        <FaRegComment /> Comments ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="input mb-2"
            required
          />
          <button type="submit" disabled={submitting || !body.trim()} className="btn btn-primary text-sm">
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="mb-8 rounded-lg bg-theme-light p-4 text-center text-text">
          <a href="/login" className="text-primary underline">Sign in</a> to join the conversation.
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-20 w-full" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-text">Be the first to comment.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="mb-2 flex items-center gap-2">
                {c.author?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.author.avatar_url} alt={c.author.username} className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                    {c.author?.username?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <span className="font-semibold text-text-dark dark:text-white">{c.author?.username ?? "Anonymous"}</span>
                <span className="text-xs text-text">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm text-text">{c.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
