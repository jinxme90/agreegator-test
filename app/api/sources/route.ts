import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServiceClient()

  const { data: sources, error } = await supabase
    .from('sources')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sources })
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()

  try {
    const body = await request.json()
    const { name, url, rss_url, category, description } = body

    if (!name || !url || !rss_url || !category) {
      return NextResponse.json(
        { error: 'name, url, rss_url, and category are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('sources')
      .insert({
        name,
        url,
        rss_url,
        category,
        description: description || null,
        is_active: true,
        fetch_status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ source: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
