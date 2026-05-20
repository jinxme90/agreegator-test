'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { HeroArticle } from '@/components/ui/HeroArticle'
import { LoadingState, HeroSkeleton } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { FeedFilters } from '@/components/features/FeedFilters'
import { Sidebar } from '@/components/layout/Sidebar'
import { getSessionId } from '@/lib/session'
import type { Article, Source } from '@/types'
import { RefreshCw, ChevronDown } from 'lucide-react'

function HomeFeed() {
  const searchParams = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'latest'
  const timeFilter = searchParams.get('time') || 'all'

  const fetchArticles = useCallback(
    async (pageNum: number, replace = false) => {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)
      setError(null)

      try {
        const sessionId = getSessionId()
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: '21',
          sort,
          timeFilter,
          sessionId,
        })
        if (category) params.set('category', category)
        if (search) params.set('search', search)

        const res = await fetch(`/api/articles?${params}`)
        if (!res.ok) throw new Error('Failed to load articles')
        const data = await res.json()

        setArticles((prev) => (replace || pageNum === 1 ? data.articles : [...prev, ...data.articles]))
        setTotalPages(data.totalPages)
        setPage(pageNum)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load articles')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [category, search, sort, timeFilter]
  )

  useEffect(() => {
    fetchArticles(1, true)
  }, [fetchArticles])

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const res = await fetch('/api/sources')
        if (res.ok) {
          const data = await res.json()
          setSources(data.sources || [])
        }
      } catch {
        // sources are optional
      }
    }
    fetchSources()
  }, [])

  const handleSave = useCallback(async (id: string, saved: boolean) => {
    const sessionId = getSessionId()
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_saved: saved } : a))
    )
    try {
      if (saved) {
        await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId: id, sessionId }),
        })
      } else {
        await fetch(`/api/saved?articleId=${id}&sessionId=${sessionId}`, { method: 'DELETE' })
      }
    } catch {
      // revert on error
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_saved: !saved } : a))
      )
    }
  }, [])

  const handleRead = useCallback(async (id: string, read: boolean) => {
    const sessionId = getSessionId()
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: read } : a))
    )
    try {
      if (read) {
        await fetch('/api/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId: id, sessionId }),
        })
      } else {
        await fetch(`/api/read?articleId=${id}&sessionId=${sessionId}`, { method: 'DELETE' })
      }
    } catch {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: !read } : a))
      )
    }
  }, [])

  const heroArticle = articles[0]
  const feedArticles = articles.slice(1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-8">
        {/* Sidebar */}
        <Sidebar sources={sources} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Feed Filters */}
          <div className="mb-6">
            <FeedFilters showCategoryTabs={true} />
          </div>

          {/* Hero Article */}
          {loading ? (
            <div className="mb-6">
              <HeroSkeleton />
            </div>
          ) : heroArticle ? (
            <div className="mb-6">
              <HeroArticle
                article={heroArticle}
                onSave={handleSave}
                onRead={handleRead}
              />
            </div>
          ) : null}

          {/* Article Grid */}
          {loading ? (
            <LoadingState count={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => fetchArticles(1, true)} />
          ) : feedArticles.length === 0 && !heroArticle ? (
            <EmptyState
              title="No articles found"
              description={
                search
                  ? `No articles match "${search}". Try a different search term.`
                  : category
                  ? 'No articles in this category yet. Try refreshing the feed.'
                  : 'No articles yet. Set up your sources and trigger a feed refresh.'
              }
              action={{ label: 'Manage Sources', href: '/admin/sources' }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {feedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onSave={handleSave}
                    onRead={handleRead}
                  />
                ))}
              </div>

              {/* Load more */}
              {page < totalPages && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => fetchArticles(page + 1)}
                    disabled={loadingMore}
                    className="btn-ghost flex items-center gap-2 border border-gray-200 dark:border-gray-700"
                  >
                    {loadingMore ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {loadingMore ? 'Loading…' : 'Load more articles'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6"><HeroSkeleton /></div>
        <LoadingState count={6} />
      </div>
    }>
      <HomeFeed />
    </Suspense>
  )
}
