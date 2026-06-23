"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@providers";
import { getBrowserClient } from "@lib/supabase";
import { adminMenu } from "@config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Post, Profile, SyncLog, PaymentTransaction, AuditLog } from "@types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || (profile && profile.role !== "admin"))) {
      router.push("/login");
    }
  }, [user, profile, loading, router]);

  if (loading || !user || (profile && profile.role !== "admin")) {
    return <div className="section"><div className="container-book"><div className="skeleton h-96 w-full" /></div></div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-theme-light dark:border-gray-700 dark:bg-gray-800/50">
        <div className="p-4">
          <h2 className="mb-4 text-lg font-bold text-text-dark dark:text-white">Admin Panel</h2>
          <nav className="space-y-1">
            {adminMenu.map((item) => (
              <Link key={item.url} href={item.url}
                className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  pathname === item.url ? "bg-primary text-white" : "text-text-dark hover:bg-primary-light hover:text-primary dark:text-gray-300"
                }`}>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
