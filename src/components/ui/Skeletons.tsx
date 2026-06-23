/** Skeleton loaders — shown during data fetches (never blank screens, never spinners). */

export function PostCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 w-full" />
      <div className="p-4">
        <div className="skeleton mb-3 h-4 w-24" />
        <div className="skeleton mb-2 h-6 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton mt-2 h-4 w-2/3" />
      </div>
    </div>
  );
}

export function PostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="container-book py-16">
      <div className="skeleton mx-auto mb-6 h-10 w-3/4" />
      <div className="skeleton mx-auto mb-8 h-4 w-1/2" />
      <div className="skeleton mb-8 h-64 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
