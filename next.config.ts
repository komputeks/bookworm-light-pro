import type { NextConfig } from "next";

/** Next.js 16 production configuration — optimized for serverless deployment. */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "wjyeqokhmzefvtdimtiy.supabase.co" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  // Mark googleapis as external — it uses Node.js built-ins (fs, net, tls) that can't be bundled for the browser.
  serverExternalPackages: ["googleapis"],
  // typedRoutes disabled — dynamic menu URLs don't play well with strict route typing
  // typedRoutes: true,
};

export default nextConfig;
