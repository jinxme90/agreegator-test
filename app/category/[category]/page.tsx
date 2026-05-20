'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { FeedFilters } from '@/components/features/FeedFilters'
import { Sidebar } from '@/components/layout/Sidebar'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { getSessionId } from '@/lib/session'
import type { Article, Source } from '@/types'
import { RefreshCw, ChevronDown } from 'lucide-react'

const CATEGORY_META: Record<string, { name: string; description: string }> = {
  'ux-design': { name: 'UX Design', description: 'User experience research, usability, and design thinking' },
  'ui-design': { name: 'UI Design', description: 'Visual design, typography, color, and interfaces' },
  'product-design': { name: 'Product Design', description: 'Product thinking, roadmaps, and design strategy' },
  'design-systems': { name: 'Design Systems', description: 'Component libraries, tokens, and pattern libraries' },
  'ai': { name: 'Artificial Intelligence', description: 'Machine learning, LLMs, and AI tools' },
  'technology': { name: 'Technology', description: 'Software, development, and tech culture' },
  'gadgets': { name: 'Gadgets', description: 'Consumer electronics, devices, and hardware' },
  'startups': { name: 'Startups', description: 'Funding, founders, and emerging companies' },
  'innovation': { name: 'Innovation', description: 'Emerging trends, breakthroughs, and the future' },
  'research': { name: 'Research', description: 'Studies, surveys, and data-driven insights' },
}

interface CategoryPageProps {
  params: { category: string }
}

function CategoryFeed({ params }: CategoryPageProps) {
  const searchParams = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

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
        const queryParams = new URLSearchParams({
          category: params.category,
          page: String(pageNum),
          limit: '21',
          sort,
          timeFilter,
          sessionId,
        })
        if (search) queryParams.set('search', search)

        const res = await fetch(`/api/articles?${queryParams}`)
        if (!res.ok) throw new Error('Failed to load articles')
        const data = await res.json()

        setArticles((prev) => (replace || pageNum === 1 ? data.articles : [...prev, ...data.articles]))
        setTotalPages(data.totalPages)
        setTotalCount(data.count)
        setPage(pageNum)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load articles')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [params.category, search, sort, timeFilter]
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
        // sources optional
      }
    }
    fetchSources()
  }, [])

  const handleSave = useCallback(async (id: string, saved: boolean) => {
    const sessionId = getSessionId()
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, is_saved: saved } : a)))
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
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, is_saved: !saved } : a)))
    }
  }, [])

  const handleRead = useCallback(async (id: string, read: boolean) => {
    const sessionId = getSessionId()
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: read } : a)))
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
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: !read } : a)))
    }
  }, [])

  const meta = CATEGORY_META[params.category] || { name: params.category, description: '' }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-8">
        <Sidebar sources={sources} />
        <div className="flex-1 min-w-0">
          {/* Category header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <CategoryBadge category={params.category} className="text-sm px-3 py-1" />
              {!loading && (
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  {totalCount.toLocaleString()} articles
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{meta.name}</h1>
            {meta.description && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{meta.description}</p>
            )}
          </div>

          {/* Filters */}
          <div className="mb-6">
            <FeedFilters showCategoryTabs={false} currentCategory={params.category} />
          </div>

          {/* Articles */}
          {loading ? (
            <LoadingState count={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => fetchArticles(1, true)} />
          ) : articles.length === 0 ? (
            <EmptyState
              title={`No ${meta.name} articles yet`}
              description="Articles will appear here once the feed is refreshed."
              action={{ label: 'Go to Home', href: '/' }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onSave={handleSave}
                    onRead={handleRead}
                  />
                ))}
              </div>
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
                    {loadingMore ? 'Loading…' : 'Load more'}
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

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LoadingState count={6} />
      </div>
    }>
      <CategoryFeed params={params} />
    </Suspense>
  )
}
