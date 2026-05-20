'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { getSessionId } from '@/lib/session'
import type { Article } from '@/types'
import { Newspaper, Share2, Calendar } from 'lucide-react'
import { format } from 'date-fns'

const CATEGORY_LABELS: Record<string, string> = {
  'ux-design': 'UX Design',
  'ui-design': 'UI Design',
  'product-design': 'Product Design',
  'design-systems': 'Design Systems',
  'ai': 'Artificial Intelligence',
  'technology': 'Technology',
  'gadgets': 'Gadgets',
  'startups': 'Startups',
  'innovation': 'Innovation',
  'research': 'Research',
}

export default function DailyDigestPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [grouped, setGrouped] = useState<Record<string, Article[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)

  const fetchDigest = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const sessionId = getSessionId()
      const res = await fetch(`/api/daily-digest?sessionId=${sessionId}`)
      if (!res.ok) throw new Error('Failed to load digest')
      const data = await res.json()
      setArticles(data.articles || [])
      setGrouped(data.grouped || {})
      setDate(data.date)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load digest')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDigest()
  }, [fetchDigest])

  const handleSave = useCallback(async (id: string, saved: boolean) => {
    const sessionId = getSessionId()
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, is_saved: saved } : a)))
    setGrouped((prev) => {
      const updated = { ...prev }
      for (const cat of Object.keys(updated)) {
        updated[cat] = updated[cat].map((a) => (a.id === id ? { ...a, is_saved: saved } : a))
      }
      return updated
    })
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
    setGrouped((prev) => {
      const updated = { ...prev }
      for (const cat of Object.keys(updated)) {
        updated[cat] = updated[cat].map((a) => (a.id === id ? { ...a, is_read: read } : a))
      }
      return updated
    })
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

  const handleShare = async () => {
    const text = `Today's UX Radar Digest — ${articles.length} top articles\n${window.location.href}`
    if (navigator.share) {
      await navigator.share({ title: "Today's UX Radar Digest", url: window.location.href })
    } else {
      await navigator.clipboard.writeText(text)
      alert('Digest URL copied to clipboard!')
    }
  }

  const formattedDate = date ? format(new Date(date), 'EEEE, MMMM d, yyyy') : ''

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Today&apos;s Top Picks</h1>
            {formattedDate && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </p>
            )}
          </div>
        </div>
        {!loading && articles.length > 0 && (
          <button onClick={handleShare} className="btn-ghost flex items-center gap-2 text-sm border border-gray-200 dark:border-gray-700">
            <Share2 className="w-4 h-4" />
            Share Digest
          </button>
        )}
      </div>

      {loading ? (
        <LoadingState count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDigest} />
      ) : articles.length === 0 ? (
        <EmptyState
          title="No articles today"
          description="The daily digest is built from articles published today. Check back later or refresh the feed."
          action={{ label: 'Browse All Articles', href: '/' }}
        />
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, catArticles]) => (
            <section key={category}>
              <div className="flex items-center gap-2 mb-4">
                <CategoryBadge category={category} className="text-sm px-3 py-1" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {CATEGORY_LABELS[category] || category}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {catArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onSave={handleSave}
                    onRead={handleRead}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
