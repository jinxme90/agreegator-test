import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()

  try {
    const { sessionId, subscription, categories, sources } = await request.json()

    if (!sessionId || !subscription) {
      return NextResponse.json(
        { error: 'sessionId and subscription are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('notification_subscriptions')
      .upsert(
        {
          session_id: sessionId,
          subscription,
          categories: categories || [],
          sources: sources || [],
        },
        { onConflict: 'session_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createServiceClient()
  try {
    const { sessionId } = await request.json()
    if (!sessionId) return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    await supabase.from('notification_subscriptions').delete().eq('session_id', sessionId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
