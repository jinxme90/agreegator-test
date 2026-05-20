import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { fetchRSSFeed, estimateReadingTime } from '@/lib/rss'
import { categorizeArticle } from '@/lib/categories'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient()

  const { data: source, error: sourceError } = await supabase
    .from('sources')
    .select('*')
    .eq('id', params.id)
    .single()

  if (sourceError || !source) {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 })
  }

  try {
    const items = await fetchRSSFeed(source.rss_url)

    const articles = items
      .map((item) => ({
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
      }))
      .filter((a) => a.url && a.title)

    let articlesAdded = 0

    if (articles.length > 0) {
      const { data: upserted, error: upsertError } = await supabase
        .from('articles')
        .upsert(articles, { onConflict: 'url', ignoreDuplicates: true })
        .select('id')

      if (upsertError) throw new Error(upsertError.message)
      articlesAdded = upserted?.length || 0
    }

    await supabase
      .from('sources')
      .update({
        last_fetched_at: new Date().toISOString(),
        fetch_status: 'success',
      })
      .eq('id', source.id)

    return NextResponse.json({
      ok: true,
      articlesAdded,
      totalFetched: items.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    await supabase
      .from('sources')
      .update({
        last_fetched_at: new Date().toISOString(),
        fetch_status: 'error',
      })
      .eq('id', source.id)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
