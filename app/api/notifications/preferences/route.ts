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
    .from('notification_subscriptions')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error) {
    return NextResponse.json({ preferences: null })
  }

  return NextResponse.json({ preferences: data })
}

export async function PUT(request: NextRequest) {
  const supabase = createServiceClient()

  try {
    const { sessionId, categories, sources, quiet_hours_start, quiet_hours_end, daily_digest } =
      await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (categories !== undefined) updateData.categories = categories
    if (sources !== undefined) updateData.sources = sources
    if (quiet_hours_start !== undefined) updateData.quiet_hours_start = quiet_hours_start
    if (quiet_hours_end !== undefined) updateData.quiet_hours_end = quiet_hours_end
    if (daily_digest !== undefined) updateData.daily_digest = daily_digest

    const { data, error } = await supabase
      .from('notification_subscriptions')
      .update(updateData)
      .eq('session_id', sessionId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, preferences: data })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
