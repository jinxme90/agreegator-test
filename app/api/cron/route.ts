import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { fetchRSSFeed, estimateReadingTime } from '@/lib/rss'
import { categorizeArticle } from '@/lib/categories'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { data: sources, error: sourcesError } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true)

  if (sourcesError) {
    return NextResponse.json({ error: sourcesError.message }, { status: 500 })
  }

  const results = {
    total: sources?.length || 0,
    success: 0,
    failed: 0,
    articlesAdded: 0,
    errors: [] as string[],
  }

  for (const source of sources || []) {
    try {
      const items = await fetchRSSFeed(source.rss_url)

      const articles = items.map((item) => ({
        source_id: source.id,
        title: item.title,
        url: item.url,
        summary: item.summary || null,
        author: item.author || null,
        published_at: item.published_at,
        image_url: item.image_url || null,
        category: categorizeArticle(item.title, item.summary || '', source.category),
        reading_time: estimateReadingTime(item.summary || item.title),
        is_featured: false,
      })).filter((a) => a.url && a.title)

      if (articles.length > 0) {
        const { data: upserted, error: upsertError } = await supabase
          .from('articles')
          .upsert(articles, { onConflict: 'url', ignoreDuplicates: true })
          .select('id')

        if (upsertError) {
          throw new Error(upsertError.message)
        }

        results.articlesAdded += upserted?.length || 0
      }

      await supabase
        .from('sources')
        .update({
          last_fetched_at: new Date().toISOString(),
          fetch_status: 'success',
        })
        .eq('id', source.id)

      results.success++
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      results.failed++
      results.errors.push(`${source.name}: ${message}`)

      await supabase
        .from('sources')
        .update({
          last_fetched_at: new Date().toISOString(),
          fetch_status: 'error',
        })
        .eq('id', source.id)
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    ...results,
  })
}

// POST handler allows admin-triggered refresh without requiring auth header
export async function POST(request: NextRequest) {
  return GET(request)
}
