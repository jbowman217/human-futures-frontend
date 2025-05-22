import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabaseClient'

export async function POST(req: Request) {
  const { content, mission_id, user_id, page_type } = await req.json()

  if (!content || !mission_id || !page_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        temperature: 0.8,
        messages: [
          {
            role: 'system',
            content: `
You are an AI remix engine for a justice-driven learning platform. 
When a student shares a thought or reflection, you return 3 things:

1. A new novel challenge that extends their thinking.
2. A remix prompt to reframe or reapply their idea.
3. A justice or real-world extension to help connect it to community impact.

Make your suggestions actionable, specific, and aligned to middle/high school students.
            `.trim(),
          },
          {
            role: 'user',
            content: `Student wrote: "${content}".\nPage type: ${page_type}.\nGenerate the remix response now.`
          }
        ],
      })
    })

    const result = await openaiRes.json()
    const aiText = result.choices?.[0]?.message?.content || '[No remix generated]'

    // Parse simple text structure into 3 parts (very basic for now)
    const challengeMatch = aiText.match(/1\.\s*(.*?)\n2\./s)
    const remixMatch = aiText.match(/2\.\s*(.*?)\n3\./s)
    const justiceMatch = aiText.match(/3\.\s*(.*)/s)

    const ai_challenge = challengeMatch?.[1]?.trim() || ''
    const remix_prompt = remixMatch?.[1]?.trim() || ''
    const justice_extension = justiceMatch?.[1]?.trim() || ''

    // Store in Supabase
    const { error } = await supabase.from('ai_generated_challenges').insert([
      {
        mission_id,
        user_id,
        student_content: content,
        page_type,
        ai_challenge,
        remix_prompt,
        justice_extension,
        created_at: new Date().toISOString()
      }
    ])

    if (error) {
      console.error('❌ Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save remix output' }, { status: 500 })
    }

    return NextResponse.json({
      ai_challenge,
      remix_prompt,
      justice_extension
    }, { status: 200 })

  } catch (err) {
    console.error('❌ OpenAI remix call failed:', err)
    return NextResponse.json({ error: 'OpenAI call failed' }, { status: 500 })
  }
}
