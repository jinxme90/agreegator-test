'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { SortOption, TimeFilter } from '@/types'

const CATEGORIES = [
  { slug: '', label: 'All' },
  { slug: 'ux-design', label: 'UX Design' },
  { slug: 'ui-design', label: 'UI Design' },
  { slug: 'product-design', label: 'Product Design' },
  { slug: 'design-systems', label: 'Design Systems' },
  { slug: 'ai', label: 'AI' },
  { slug: 'technology', label: 'Technology' },
  { slug: 'gadgets', label: 'Gadgets' },
  { slug: 'startups', label: 'Startups' },
  { slug: 'innovation', label: 'Innovation' },
  { slug: 'research', label: 'Research' },
]

interface FeedFiltersProps {
  showCategoryTabs?: boolean
  currentCategory?: string
}

export function FeedFilters({ showCategoryTabs = true, currentCategory = '' }: FeedFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const sort = (searchParams.get('sort') as SortOption) || 'latest'
  const timeFilter = (searchParams.get('time') as TimeFilter) || 'all'
  const search = searchParams.get('search') || ''
  const [searchInput, setSearchInput] = useState(search)

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParam('search', searchInput)
  }

  function clearSearch() {
    setSearchInput('')
    updateParam('search', '')
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Category tabs */}
      {showCategoryTabs && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.slug}
              onClick={() => updateParam('category', cat.slug)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                (searchParams.get('category') || '') === cat.slug
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Search + filters row */}
      <div className="flex gap-2 items-center">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200
              dark:border-gray-700 rounded-xl outline-none focus:border-indigo-300 dark:focus:border-indigo-700
              text-gray-900 dark:text-gray-100 placeholder:text-gray-400 transition-colors"
          />
          {searchInput && (
            <button type="button" onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </form>

        {/* Time filter */}
        <div className="hidden sm:flex gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-0.5">
          {(['today', 'week', 'all'] as TimeFilter[]).map(t => (
            <button
              key={t}
              onClick={() => updateParam('time', t === 'all' ? '' : t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                timeFilter === t
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t === 'all' ? 'All time' : t === 'today' ? 'Today' : 'This week'}
            </button>
          ))}
        </div>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`btn-ghost p-2 ${showAdvanced ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Sort:</label>
            <select
              value={sort}
              onChange={e => updateParam('sort', e.target.value)}
              className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 outline-none"
            >
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
              <option value="saved">Saved only</option>
              <option value="unread">Unread only</option>
            </select>
          </div>

          {/* Mobile time filter */}
          <div className="flex items-center gap-2 sm:hidden">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Time:</label>
            <select
              value={timeFilter}
              onChange={e => updateParam('time', e.target.value)}
              className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 outline-none"
            >
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
