import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local for Supabase keys
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Path to the AI Guessing Game mission folder
const missionDir = path.join(__dirname, '../curriculum/mission/ai-guessing-game');

async function run() {
  const lesson = JSON.parse(fs.readFileSync(path.join(missionDir, 'lesson.json'), 'utf-8'));
  const problems = JSON.parse(fs.readFileSync(path.join(missionDir, 'problems.json'), 'utf-8'));

  // Insert objectives
  const insertedObjectives = [];
  for (const objText of lesson.objectives) {
    const { data, error } = await supabase
      .from('objectives')
      .insert([{ objective_text: objText, topic: lesson.title, ap_alignment: lesson.justice_theme }])
      .select();
    if (error) console.error('❌ Objective insert error:', error);
    if (data) insertedObjectives.push(data[0]);
  }

  // Insert mission
  const { data: missionData, error: missionError } = await supabase
    .from('missions')
    .insert([
      {
        title: lesson.title,
        short_background_context: lesson.justice_theme,
        tasks: null // Replace later if you add tasks.json
      }
    ])
    .select();

  if (missionError) {
    console.error('❌ Mission insert error:', missionError);
    return;
  }

  const missionId = missionData[0].id;

  // Link mission ↔ objectives
  for (const obj of insertedObjectives) {
    const { error } = await supabase.from('mission_objectives').insert([
      { mission_id: missionId, objective_id: obj.id }
    ]);
    if (error) console.error('❌ mission_objectives insert error:', error);
  }

  // Insert problems (attach to first objective for now)
  for (const prob of problems) {
    const insertData = {
      objective_id: insertedObjectives[0].id,
      problem_text: prob.problem_text,
      solution_text: prob.solution_text,
      difficulty_level: prob.difficulty_level,
      tags: Array.isArray(prob.tags) ? prob.tags : [],
      format: prob.format || 'open_response'
    };

    const { error } = await supabase.from('problems').insert([insertData]);
    if (error) {
      console.error('❌ Problem insert error:', error);
      console.log('🔍 Problem that failed:', insertData);
    } else {
      console.log('✅ Problem inserted:', insertData.problem_text.slice(0, 60) + '...');
    }
  }

  console.log(`✅ Mission "${lesson.title}" inserted with ${insertedObjectives.length} objectives and ${problems.length} problems.`);
}

run();
