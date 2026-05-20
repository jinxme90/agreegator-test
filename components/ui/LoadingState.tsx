export function ArticleCardSkeleton() {
  return (
    <div className="article-card p-4 animate-pulse">
      <div className="skeleton h-40 w-full rounded-xl mb-4" />
      <div className="skeleton h-3 w-20 rounded-full mb-3" />
      <div className="skeleton h-5 w-full rounded mb-2" />
      <div className="skeleton h-5 w-3/4 rounded mb-3" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[420px] rounded-2xl skeleton animate-pulse" />
  )
}

export function LoadingState({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  )
}
