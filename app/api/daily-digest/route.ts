import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  const supabase = createServiceClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: articles, error } = await supabase
    .from('articles')
    .select('*, source:sources(id, name, url, category, favicon, description, fetch_status, is_active, rss_url, created_at)')
    .gte('published_at', today.toISOString())
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group articles by category and pick top articles per category
  const byCategory = new Map<string, typeof articles>()

  for (const article of articles || []) {
    const cat = article.category
    if (!byCategory.has(cat)) {
      byCategory.set(cat, [])
    }
    byCategory.get(cat)!.push(article)
  }

  const topArticles: typeof articles = []
  const categoryOrder = [
    'ux-design',
    'ai',
    'technology',
    'ui-design',
    'product-design',
    'gadgets',
    'design-systems',
    'startups',
    'innovation',
    'research',
  ]

  for (const cat of categoryOrder) {
    const catArticles = byCategory.get(cat) || []
    const top = catArticles.slice(0, 2)
    topArticles.push(...top)
    if (topArticles.length >= 10) break
  }

  // Fill up to 10 if needed from other categories
  if (topArticles.length < 10) {
    for (const article of articles || []) {
      if (!topArticles.find((a) => a.id === article.id)) {
        topArticles.push(article)
        if (topArticles.length >= 10) break
      }
    }
  }

  // Apply saved/read state if sessionId provided
  let savedIds = new Set<string>()
  let readIds = new Set<string>()

  if (sessionId && topArticles.length > 0) {
    const ids = topArticles.map((a) => a.id)

    const { data: saved } = await supabase
      .from('saved_articles')
      .select('article_id')
      .eq('session_id', sessionId)
      .in('article_id', ids)

    savedIds = new Set(saved?.map((s) => s.article_id) || [])

    const { data: read } = await supabase
      .from('read_articles')
      .select('article_id')
      .eq('session_id', sessionId)
      .in('article_id', ids)

    readIds = new Set(read?.map((r) => r.article_id) || [])
  }

  const digestArticles = topArticles.slice(0, 10).map((a) => ({
    ...a,
    is_saved: savedIds.has(a.id),
    is_read: readIds.has(a.id),
  }))

  // Group final result by category
  const grouped: Record<string, typeof digestArticles> = {}
  for (const article of digestArticles) {
    if (!grouped[article.category]) {
      grouped[article.category] = []
    }
    grouped[article.category].push(article)
  }

  return NextResponse.json({
    date: today.toISOString(),
    articles: digestArticles,
    grouped,
  })
}
