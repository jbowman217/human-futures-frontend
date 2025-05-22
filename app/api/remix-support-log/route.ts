import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabaseClient'

export async function POST(req: Request) {
  const { mission_id, user_id, action } = await req.json()

  if (!mission_id || !user_id || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await supabase.from('ai_support_log').insert([
    {
      mission_id,
      user_id,
      action,
      created_at: new Date().toISOString()
    }
  ])

  if (error) {
    console.error('❌ Supabase insert error:', error)
    return NextResponse.json({ error: 'Insert failed', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
