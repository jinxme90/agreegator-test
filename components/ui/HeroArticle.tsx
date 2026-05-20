'use client'

import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Clock, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react'
import { CategoryBadge } from './CategoryBadge'
import type { Article } from '@/types'

interface HeroArticleProps {
  article: Article
  onSave?: (id: string, saved: boolean) => void
  onRead?: (id: string, read: boolean) => void
}

export function HeroArticle({ article, onSave, onRead }: HeroArticleProps) {
  const timeAgo = formatDistanceToNow(new Date(article.published_at || article.created_at), { addSuffix: true })

  return (
    <div className="relative w-full h-[420px] md:h-[500px] rounded-2xl overflow-hidden group">
      {/* Background */}
      {article.image_url ? (
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
          priority
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge category={article.category} />
          <span className="text-white/70 text-sm">{article.source?.name}</span>
          <span className="text-white/40">·</span>
          <span className="text-white/70 text-sm">{timeAgo}</span>
          {article.reading_time && (
            <>
              <span className="text-white/40">·</span>
              <Clock className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/70 text-sm">{article.reading_time}m read</span>
            </>
          )}
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onRead?.(article.id, true)}
          className="block mb-4"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight
            hover:text-indigo-200 transition-colors max-w-3xl">
            {article.title}
          </h1>
        </a>

        {article.summary && (
          <p className="text-white/70 text-sm md:text-base max-w-2xl line-clamp-2 mb-4 hidden sm:block">
            {article.summary}
          </p>
        )}

        <div className="flex items-center gap-2">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRead?.(article.id, true)}
            className="flex items-center gap-2 bg-white text-gray-900 font-semibold text-sm px-4 py-2 rounded-xl
              hover:bg-indigo-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Read article
          </a>
          <button
            onClick={() => onSave?.(article.id, !article.is_saved)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold
              text-sm px-4 py-2 rounded-xl transition-colors backdrop-blur-sm"
          >
            {article.is_saved ? (
              <BookmarkCheck className="w-4 h-4 text-indigo-300" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
