import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('saved_articles')
    .select('*, article:articles(*, source:sources(*))')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const articles = data?.map((saved) => ({
    ...saved.article,
    is_saved: true,
    saved_at: saved.created_at,
  }))

  return NextResponse.json({ articles })
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()

  try {
    const { articleId, sessionId } = await request.json()

    if (!articleId || !sessionId) {
      return NextResponse.json(
        { error: 'articleId and sessionId are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('saved_articles').upsert(
      { article_id: articleId, session_id: sessionId },
      { onConflict: 'article_id,session_id' }
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const articleId = searchParams.get('articleId')
  const sessionId = searchParams.get('sessionId')
  const clearAll = searchParams.get('clearAll')

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  if (clearAll === 'true') {
    const { error } = await supabase.from('saved_articles').delete().eq('session_id', sessionId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (!articleId) {
    return NextResponse.json({ error: 'articleId is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('saved_articles')
    .delete()
    .eq('article_id', articleId)
    .eq('session_id', sessionId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
