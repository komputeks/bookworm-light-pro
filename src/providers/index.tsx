"use client";

import { AuthProvider, useAuth } from "./AuthProvider";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import type { ReactNode } from "react";

/** Root providers wrapper — wraps the entire app with Auth + Theme contexts. */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

export { useAuth, useTheme };
