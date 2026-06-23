"use client";
import { useEffect } from "react";

/** Updates the reading progress bar width based on scroll position. */
export default function ReadingProgressClient() {
  useEffect(() => {
    const onScroll = () => {
      const bar = document.getElementById("reading-progress-bar");
      if (!bar) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${pct}%`;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}
