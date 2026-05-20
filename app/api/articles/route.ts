import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const source = searchParams.get('source')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'latest'
  const timeFilter = searchParams.get('timeFilter') || 'all'
  const sessionId = searchParams.get('sessionId')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  const supabase = createServiceClient()

  let query = supabase
    .from('articles')
    .select('*, source:sources(id, name, url, category, favicon, description, fetch_status, is_active, rss_url, created_at)', { count: 'exact' })

  if (category) {
    query = query.eq('category', category)
  }

  if (source) {
    query = query.eq('source_id', source)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
  }

  if (timeFilter === 'today') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    query = query.gte('published_at', today.toISOString())
  } else if (timeFilter === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    query = query.gte('published_at', weekAgo.toISOString())
  }

  if (sort === 'latest') {
    query = query.order('published_at', { ascending: false })
  } else if (sort === 'oldest') {
    query = query.order('published_at', { ascending: true })
  } else {
    query = query.order('published_at', { ascending: false })
  }

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data: articles, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let savedArticleIds = new Set<string>()
  let readArticleIds = new Set<string>()

  if (sessionId && articles && articles.length > 0) {
    const articleIds = articles.map((a) => a.id)

    if (sort === 'saved') {
      const { data: saved } = await supabase
        .from('saved_articles')
        .select('article_id')
        .eq('session_id', sessionId)
        .in('article_id', articleIds)

      savedArticleIds = new Set(saved?.map((s) => s.article_id) || [])

      const { data: allSaved } = await supabase
        .from('saved_articles')
        .select('article_id')
        .eq('session_id', sessionId)

      if (!allSaved || allSaved.length === 0) {
        return NextResponse.json({
          articles: [],
          count: 0,
          page,
          limit,
          totalPages: 0,
        })
      }
    } else {
      const { data: saved } = await supabase
        .from('saved_articles')
        .select('article_id')
        .eq('session_id', sessionId)
        .in('article_id', articleIds)

      savedArticleIds = new Set(saved?.map((s) => s.article_id) || [])
    }

    const { data: read } = await supabase
      .from('read_articles')
      .select('article_id')
      .eq('session_id', sessionId)
      .in('article_id', articleIds)

    readArticleIds = new Set(read?.map((r) => r.article_id) || [])

    if (sort === 'unread') {
      const unreadArticles = articles.filter((a) => !readArticleIds.has(a.id))
      return NextResponse.json({
        articles: unreadArticles.map((a) => ({
          ...a,
          is_saved: savedArticleIds.has(a.id),
          is_read: readArticleIds.has(a.id),
        })),
        count: unreadArticles.length,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      })
    }
  }

  let filteredArticles = articles || []

  if (sort === 'saved' && sessionId) {
    const { data: savedArticles } = await supabase
      .from('saved_articles')
      .select('article_id')
      .eq('session_id', sessionId)

    const savedIds = new Set(savedArticles?.map((s) => s.article_id) || [])
    filteredArticles = filteredArticles.filter((a) => savedIds.has(a.id))
  }

  const enrichedArticles = filteredArticles.map((article) => ({
    ...article,
    is_saved: savedArticleIds.has(article.id),
    is_read: readArticleIds.has(article.id),
  }))

  return NextResponse.json({
    articles: enrichedArticles,
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  })
}
