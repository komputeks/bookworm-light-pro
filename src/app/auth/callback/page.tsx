"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@lib/supabase";

/** OAuth callback handler — exchanges code for session, then redirects to dashboard. */
export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.push("/dashboard");
    });
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="skeleton mx-auto mb-4 h-8 w-48" />
        <p className="text-text">Completing sign in...</p>
      </div>
    </div>
  );
}
