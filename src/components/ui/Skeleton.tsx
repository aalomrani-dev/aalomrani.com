/* Loading skeletons (kp-sk shimmer from index.css). Matches the FileCard
   footprint so the swap from loading → content has no layout shift. */

export function SkeletonCard() {
  return (
    <div className="p-5 rounded-[var(--radius-lg)] bg-surface border border-line" style={{ minHeight: 176 }}>
      <div className="flex items-center justify-between mb-4">
        <span className="kp-sk block w-11 h-11 rounded-[var(--radius-sm)]" />
        <span className="kp-sk block w-14 h-6 rounded-[var(--radius-sm)]" />
      </div>
      <span className="kp-sk block h-5 w-4/5 rounded mb-2" />
      <span className="kp-sk block h-5 w-3/5 rounded mb-6" />
      <span className="kp-sk block h-4 w-2/3 rounded" />
    </div>
  )
}

interface SkeletonGridProps {
  count?: number
  className?: string
}

export function SkeletonGrid({ count = 6, className = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' }: SkeletonGridProps) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
