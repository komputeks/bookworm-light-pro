"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { mainMenu, siteConfig } from "@config";
import { useAuth, useTheme } from "@providers";
import ThemeToggle from "@components/ui/ThemeToggle";
import { IoSearch, IoMenu, IoClose } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";

export default function Header() {
  const [navFixed, setNavFixed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setNavFixed(window.scrollY >= 1);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-white transition-all dark:border-gray-700 dark:bg-theme-dark ${
        navFixed ? "shadow-md" : ""
      }`}
    >
      <nav className="container-wide flex items-center justify-between py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-text-dark dark:text-white">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">B</span>
          {siteConfig.name}
        </Link>

        {/* Desktop menu */}
        <ul className="hidden items-center gap-1 md:flex">
          {mainMenu.map((item) => (
            <li key={item.url}>
              <Link
                href={item.url}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-primary-light hover:text-primary dark:hover:bg-gray-700 ${
                  pathname === item.url ? "text-primary" : "text-text dark:text-gray-300"
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side: search, theme, auth */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-lg p-2 text-text-dark transition hover:bg-primary-light hover:text-primary dark:text-gray-300"
            aria-label="Search"
          >
            <IoSearch className="text-xl" />
          </button>
          <ThemeToggle />

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-primary-light"
              >
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.username} className="h-8 w-8 rounded-full" />
                ) : (
                  <FaUserCircle className="h-8 w-8 text-text-light" />
                )}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <Link href="/dashboard" className="block px-4 py-2 text-sm text-text hover:bg-theme-light dark:text-gray-300 dark:hover:bg-gray-700">Dashboard</Link>
                  {profile?.role === "admin" && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-text hover:bg-theme-light dark:text-gray-300 dark:hover:bg-gray-700">Admin Panel</Link>
                  )}
                  {profile?.username && (
                    <Link href={`/profile/${profile.username}`} className="block px-4 py-2 text-sm text-text hover:bg-theme-light dark:text-gray-300 dark:hover:bg-gray-700">My Profile</Link>
                  )}
                  <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-text hover:bg-theme-light dark:text-gray-300 dark:hover:bg-gray-700">Settings</Link>
                  <hr className="my-1 border-border dark:border-gray-600" />
                  <button onClick={signOut} className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden btn btn-primary text-sm md:inline-block">Sign In</Link>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-text-dark dark:text-white md:hidden" aria-label="Menu">
            {mobileOpen ? <IoClose className="text-xl" /> : <IoMenu className="text-xl" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-white dark:border-gray-700 dark:bg-theme-dark md:hidden">
          <ul className="container-wide py-2">
            {mainMenu.map((item) => (
              <li key={item.url}>
                <Link href={item.url} className="block py-2 text-text-dark dark:text-gray-300">{item.name}</Link>
              </li>
            ))}
            {user ? (
              <>
                <li><Link href="/dashboard" className="block py-2 text-text-dark dark:text-gray-300">Dashboard</Link></li>
                <li><button onClick={signOut} className="block py-2 text-red-500">Sign Out</button></li>
              </>
            ) : (
              <li><Link href="/login" className="block py-2 text-primary">Sign In</Link></li>
            )}
          </ul>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-2xl px-4" onClick={(e) => e.stopPropagation()}>
            <form action="/search" className="flex gap-2">
              <input
                name="q"
                autoFocus
                placeholder="Search posts..."
                className="input text-lg"
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
