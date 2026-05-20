'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { getSessionId } from '@/lib/session'
import type { Article } from '@/types'
import { Bookmark } from 'lucide-react'

export default function SavedPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSaved = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const sessionId = getSessionId()
      const res = await fetch(`/api/saved?sessionId=${sessionId}`)
      if (!res.ok) throw new Error('Failed to load saved articles')
      const data = await res.json()
      setArticles((data.articles || []).map((a: Article) => ({ ...a, is_saved: true })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved articles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSaved()
  }, [fetchSaved])

  const handleSave = useCallback(async (id: string, saved: boolean) => {
    const sessionId = getSessionId()
    if (!saved) {
      // Remove from list when unsaved
      setArticles((prev) => prev.filter((a) => a.id !== id))
    }
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
      // Revert on error
      fetchSaved()
    }
  }, [fetchSaved])

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Saved Articles</h1>
          {!loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'} saved
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingState count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSaved} />
      ) : articles.length === 0 ? (
        <EmptyState
          title="No saved articles"
          description="Save articles as you browse to find them here later."
          action={{ label: 'Browse Feed', href: '/' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onSave={handleSave}
              onRead={handleRead}
            />
          ))}
        </div>
      )}
    </div>
  )
}
