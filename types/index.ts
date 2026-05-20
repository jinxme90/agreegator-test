export interface Source {
  id: string
  name: string
  url: string
  rss_url: string
  category: string
  favicon?: string
  description?: string
  is_active: boolean
  last_fetched_at?: string
  fetch_status: 'pending' | 'success' | 'error'
  created_at: string
}

export interface Article {
  id: string
  source_id: string
  title: string
  url: string
  image_url?: string
  summary?: string
  author?: string
  published_at: string
  category: string
  reading_time?: number
  is_featured: boolean
  created_at: string
  source?: Source
  is_saved?: boolean
  is_read?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

export interface SavedArticle {
  id: string
  article_id: string
  session_id: string
  created_at: string
}

export interface ReadArticle {
  id: string
  article_id: string
  session_id: string
  created_at: string
}

export interface NotificationPreference {
  id: string
  session_id: string
  subscription: PushSubscription
  categories: string[]
  sources: string[]
  quiet_hours_start?: number
  quiet_hours_end?: number
  daily_digest: boolean
  created_at: string
}

export type SortOption = 'latest' | 'oldest' | 'saved' | 'unread'
export type TimeFilter = 'today' | 'week' | 'all'

export interface FeedFilters {
  category?: string
  source?: string
  search?: string
  sort: SortOption
  timeFilter: TimeFilter
}
