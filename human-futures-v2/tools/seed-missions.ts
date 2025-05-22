import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedMissions(basePath: string) {
  const lessons = fs.readdirSync(basePath)

  for (const lessonFolder of lessons) {
    const lessonPath = path.join(basePath, lessonFolder, 'lesson.json')
    if (!fs.existsSync(lessonPath)) continue

    const lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'))

    const { data, error } = await supabase
      .from('missions')
      .upsert([lessonData], { onConflict: ['lesson_id'] })

    if (error) {
      console.error(`❌ Error seeding ${lessonFolder}:`, error)
    } else {
      console.log(`✅ Seeded: ${lessonData.lesson_id}`)
    }
  }
}

seedMissions('./src/grade4/module1').then(() => console.log('✅ Done seeding.'))