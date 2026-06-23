"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@providers";
import { siteConfig } from "@config";
import { FaGoogle, FaEnvelope, FaLock, FaUser } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-primary">{siteConfig.name}</Link>
          <h1 className="mt-2 text-2xl font-bold text-text-dark dark:text-white">Welcome back</h1>
          <p className="text-text">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="input pl-10" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-dark dark:text-white">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="input pl-10" placeholder="••••••••" />
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="my-4 text-center text-text">or</div>

        <button onClick={signInWithGoogle} className="btn btn-outline w-full">
          <FaGoogle className="mr-2" /> Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-text">
          Don't have an account? <Link href="/signup" className="text-primary underline">Sign up</Link>
        </p>
        <p className="mt-2 text-center text-xs text-text">
          Demo: admin@bookworm.pro / password123
        </p>
      </div>
    </div>
  );
}
