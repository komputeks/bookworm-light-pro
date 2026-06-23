import Link from "next/link";

/** Reusable pagination component — works with any route structure. */
export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;
  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const pageHref = (p: number) => (p === 1 ? basePath : `${basePath}?page=${p}`);

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 && (
        <Link href={pageHref(currentPage - 1)} className="rounded-lg border border-border px-3 py-2 text-sm text-text-dark hover:border-primary hover:text-primary dark:border-gray-600 dark:text-gray-300">
          ← Prev
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`gap-${i}`} className="px-2 text-text">...</span>
        ) : (
          <Link
            key={p}
            href={pageHref(p as number)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              p === currentPage
                ? "border-primary bg-primary text-white"
                : "border-border text-text-dark hover:border-primary hover:text-primary dark:border-gray-600 dark:text-gray-300"
            }`}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={pageHref(currentPage + 1)} className="rounded-lg border border-border px-3 py-2 text-sm text-text-dark hover:border-primary hover:text-primary dark:border-gray-600 dark:text-gray-300">
          Next →
        </Link>
      )}
    </nav>
  );
}
