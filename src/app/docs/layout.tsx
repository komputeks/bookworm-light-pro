import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Docs", description: "Documentation" };

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const docs = [
    { name: "Landing Copy", url: "/docs/landing-copy" },
    { name: "User Manual", url: "/docs/user-manual" },
    { name: "Changelog", url: "/docs/changelog" },
    { name: "Roadmap", url: "/docs/roadmap" },
  ];
  return (
    <div className="section">
      <div className="container-wide grid gap-8 lg:grid-cols-[200px_1fr]">
        <aside>
          <h2 className="mb-4 text-lg font-bold text-text-dark dark:text-white">Documentation</h2>
          <nav className="space-y-1">
            {docs.map((d) => (
              <Link key={d.url} href={d.url} className="block rounded-lg px-3 py-2 text-sm font-semibold text-text hover:bg-primary-light hover:text-primary dark:hover:bg-gray-700">{d.name}</Link>
            ))}
          </nav>
        </aside>
        <div className="prose-bookworm max-w-none">{children}</div>
      </div>
    </div>
  );
}
