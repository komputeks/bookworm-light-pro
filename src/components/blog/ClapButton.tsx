"use client";

import { useState } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useAuth } from "@providers";
import { getBrowserClient } from "@lib/supabase";

/** Medium-style clap button with optimistic UI. */
export default function ClapButton({ postId, initialLikes, liked }: { postId: string; initialLikes: number; liked: boolean }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(liked);
  const [clapping, setClapping] = useState(false);
  const { user } = useAuth();

  const handleClap = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    // Optimistic update
    const newLiked = !isLiked;
    setLikes((prev) => prev + (newLiked ? 1 : -1));
    setIsLiked(newLiked);
    setClapping(true);

    try {
      const supabase = getBrowserClient();
      if (newLiked) {
        await supabase.from("bookworm_post_likes").insert({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from("bookworm_post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      }
    } catch {
      // Revert on error
      setLikes((prev) => prev + (newLiked ? -1 : 1));
      setIsLiked(!newLiked);
    } finally {
      setClapping(false);
    }
  };

  return (
    <button
      onClick={handleClap}
      disabled={clapping}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 transition ${
        isLiked ? "border-primary bg-primary-light text-primary" : "border-border text-text hover:border-primary"
      } ${clapping ? "scale-110" : ""}`}
      aria-label="Clap"
    >
      {isLiked ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
      <span className="font-semibold">{likes}</span>
    </button>
  );
}
