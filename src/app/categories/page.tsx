import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { getCategories } from "@actions/posts";
import Link from "next/link";

export const metadata: Metadata = { title: "Categories", description: "Browse all categories" };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="section">
      <div className="container-book text-center">
        <h1 className="mb-8 text-3xl font-bold text-text-dark dark:text-white">Categories</h1>
        {categories.length === 0 ? (
          <p className="text-text">No categories yet.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(({ cat1, count }) => (
              <Link key={cat1} href={`/blog/${cat1}`}
                className="rounded-lg bg-theme-light px-5 py-3 font-semibold capitalize text-text-dark transition hover:bg-primary hover:text-white dark:bg-gray-800 dark:text-white">
                {cat1.replace(/-/g, " ")} ({count})
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
