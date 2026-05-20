'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { FeedFilters } from '@/components/features/FeedFilters'
import { Sidebar } from '@/components/layout/Sidebar'
import { getSessionId } from '@/lib/session'
import type { Article, Source } from '@/types'
import { RefreshCw, ChevronDown, Globe, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SourcePageProps {
  params: { source: string }
}

function SourceFeed({ params }: SourcePageProps) {
  const searchParams = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [source, setSource] = useState<Source | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null)

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
          source: params.source,
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
        setPage(pageNum)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load articles')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [params.source, search, sort, timeFilter]
  )

  useEffect(() => {
    fetchArticles(1, true)
  }, [fetchArticles])

  useEffect(() => {
    const fetchSource = async () => {
      try {
        const res = await fetch(`/api/sources/${params.source}`)
        if (res.ok) {
          const data = await res.json()
          setSource(data.source)
        }
      } catch {
        // ignore
      }
    }
    const fetchSources = async () => {
      try {
        const res = await fetch('/api/sources')
        if (res.ok) {
          const data = await res.json()
          setSources(data.sources || [])
        }
      } catch {
        // ignore
      }
    }
    fetchSource()
    fetchSources()
  }, [params.source])

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshMessage(null)
    try {
      const res = await fetch(`/api/sources/${params.source}/refresh`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setRefreshMessage(`Refreshed! ${data.articlesAdded} new articles added.`)
        fetchArticles(1, true)
      } else {
        setRefreshMessage(`Refresh failed: ${data.error}`)
      }
    } catch {
      setRefreshMessage('Refresh failed. Check console for details.')
    } finally {
      setRefreshing(false)
      setTimeout(() => setRefreshMessage(null), 4000)
    }
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-8">
        <Sidebar sources={sources} />
        <div className="flex-1 min-w-0">
          {/* Source Header */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                    {source?.name || 'Loading…'}
                  </h1>
                  {source?.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{source.description}</p>
                  )}
                  {source?.last_fetched_at && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last fetched {formatDistanceToNow(new Date(source.last_fetched_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {source?.fetch_status === 'success' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {source?.fetch_status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing…' : 'Refresh Feed'}
                </button>
              </div>
            </div>
            {refreshMessage && (
              <div className="mt-3 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
                {refreshMessage}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mb-6">
            <FeedFilters showCategoryTabs={false} />
          </div>

          {/* Articles */}
          {loading ? (
            <LoadingState count={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => fetchArticles(1, true)} />
          ) : articles.length === 0 ? (
            <EmptyState
              title="No articles from this source"
              description="Refresh the feed to load articles from this source."
              action={{ label: 'Go Home', href: '/' }}
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

export default function SourcePage({ params }: SourcePageProps) {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LoadingState count={6} />
      </div>
    }>
      <SourceFeed params={params} />
    </Suspense>
  )
}
