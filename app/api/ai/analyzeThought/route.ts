import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabaseClient'

export async function POST(req: Request) {
  const { content, mission_id, page_type, user_id } = await req.json()

  if (!content || !mission_id || !page_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `
You are a culturally responsive math mentor. 
When a student shares a thought, your job is to:
- Give a short, kind reflection on what they wrote
- Offer a remix prompt or follow-up question
- Connect it to justice, logic, or real-world thinking if possible
Always sound encouraging, curious, and specific.
            `.trim(),
          },
          {
            role: 'user',
            content: `Student said: "${content}".\nPage type: ${page_type}.\nWhat should we say back to help them grow or remix this idea?`,
          },
        ],
      }),
    })

    const result = await aiRes.json()
    const ai_output = result.choices?.[0]?.message?.content || '[No feedback generated]'

    const { error } = await supabase.from('ai_thought_feedback').insert([
      {
        mission_id,
        user_id,
        student_content: content,
        page_type,
        ai_feedback: ai_output,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error('❌ Supabase insert error:', error)
      return NextResponse.json({ error: 'Supabase insert failed' }, { status: 500 })
    }

    return NextResponse.json({ ai_feedback: ai_output }, { status: 200 })
  } catch (err) {
    console.error('❌ OpenAI call failed:', err)
    return NextResponse.json({ error: 'OpenAI call failed' }, { status: 500 })
  }
}
