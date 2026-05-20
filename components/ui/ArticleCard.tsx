'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Bookmark, BookmarkCheck, CheckCircle, Share2, ExternalLink, Clock } from 'lucide-react'
import { CategoryBadge } from './CategoryBadge'
import type { Article } from '@/types'

interface ArticleCardProps {
  article: Article
  onSave?: (id: string, saved: boolean) => void
  onRead?: (id: string, read: boolean) => void
  variant?: 'default' | 'compact'
}

function isNew(createdAt: string): boolean {
  const created = new Date(createdAt)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
  return created > twoHoursAgo
}

export function ArticleCard({ article, onSave, onRead, variant = 'default' }: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.published_at || article.created_at), { addSuffix: true })
  const articleIsNew = isNew(article.created_at)

  function handleSave(e: React.MouseEvent) {
    e.preventDefault()
    onSave?.(article.id, !article.is_saved)
  }

  function handleRead(e: React.MouseEvent) {
    e.preventDefault()
    onRead?.(article.id, !article.is_read)
  }

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    if (navigator.share) {
      await navigator.share({ title: article.title, url: article.url })
    } else {
      await navigator.clipboard.writeText(article.url)
    }
  }

  if (variant === 'compact') {
    return (
      <div className={`flex gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${article.is_read ? 'opacity-60' : ''}`}>
        {article.image_url && (
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <CategoryBadge category={article.category} className="text-[10px] px-1.5 py-0" />
            {articleIsNew && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">New</span>
            )}
          </div>
          <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={() => onRead?.(article.id, true)}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {article.title}
            </h3>
          </a>
          <p className="text-xs text-gray-400 mt-0.5">
            {article.source?.name} · {timeAgo}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`article-card group ${article.is_read ? 'opacity-70' : ''}`}>
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-20">📰</span>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <CategoryBadge category={article.category} />
          {articleIsNew && (
            <span className="category-badge bg-emerald-500 text-white">New</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Meta */}
        <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-400 dark:text-gray-500">
          <span className="font-medium text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
            {article.source?.name}
          </span>
          <span>·</span>
          <span>{timeAgo}</span>
          {article.reading_time && (
            <>
              <span>·</span>
              <Clock className="w-3 h-3" />
              <span>{article.reading_time}m</span>
            </>
          )}
        </div>

        {/* Title */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onRead?.(article.id, true)}
          className="block mb-2"
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug
            hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {article.title}
          </h3>
        </a>

        {/* Summary */}
        {article.summary && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {article.summary}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleSave}
              className="btn-ghost p-1.5 text-xs"
              title={article.is_saved ? 'Unsave' : 'Save'}
            >
              {article.is_saved ? (
                <BookmarkCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleRead}
              className="btn-ghost p-1.5 text-xs"
              title={article.is_read ? 'Mark unread' : 'Mark read'}
            >
              <CheckCircle className={`w-4 h-4 ${article.is_read ? 'text-green-600 dark:text-green-400' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="btn-ghost p-1.5 text-xs"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRead?.(article.id, true)}
            className="btn-ghost p-1.5 text-xs"
            title="Open article"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
