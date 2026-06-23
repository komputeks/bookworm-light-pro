"use client";

import { useTheme } from "@providers";
import { IoSunny, IoMoon } from "react-icons/io5";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-lg p-2 text-text-dark transition hover:bg-primary-light hover:text-primary dark:text-gray-300"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? <IoSunny className="text-xl" /> : <IoMoon className="text-xl" />}
    </button>
  );
}
