// /app/api/remixed/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabaseClient'

export async function POST(req: Request) {
  if (!process.env.REMIX_ENABLED || process.env.REMIX_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Remix endpoint is disabled' }, { status: 403 })
  }

  try {
    const submission = await req.json()

    if (!submission.content || !submission.page_type || !submission.mission_id) {
      return NextResponse.json({ error: 'Missing content, page_type, or mission_id' }, { status: 400 })
    }

    const payload = {
      mission_id: submission.mission_id,
      user_id: submission.user_id || 'curator-ai',
      content: submission.content,
      page_type: submission.page_type,
      tags: submission.tags || [],
      feedback: submission.feedback || null,
      level: submission.level || null,
      created_at: new Date().toISOString()
    }

    const { error } = await supabase.from('curated_thought_archive').insert([payload])

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Insert failed', detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: payload })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Remix intake endpoint for curated thoughts is live.' })
}
