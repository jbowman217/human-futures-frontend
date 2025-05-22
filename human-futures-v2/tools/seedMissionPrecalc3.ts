import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Path to mission folder
const missionDir = path.join(__dirname, '../curriculum/mission/precalc-u3-trig-polar');

async function run() {
  const lesson = JSON.parse(fs.readFileSync(path.join(missionDir, 'lesson.json'), 'utf-8'));
  const problems = JSON.parse(fs.readFileSync(path.join(missionDir, 'problems.json'), 'utf-8'));

  // 1. Insert objectives
  const insertedObjectives = [];
  for (const objText of lesson.objectives) {
    const { data, error } = await supabase
      .from('objectives')
      .insert([{ objective_text: objText, topic: lesson.title, ap_alignment: 'Pre-Calc U3' }])
      .select();

    if (error) {
      console.error('❌ Objective insert error:', error);
    }
    if (data) {
      insertedObjectives.push(data[0]);
    }
  }

  // 2. Insert mission
  const { data: missionData, error: missionError } = await supabase
    .from('missions')
    .insert([
      {
        title: lesson.title,
        short_background_context: lesson.justice_theme,
        tasks: null // Add later
      }
    ])
    .select();

  if (missionError) {
    console.error('❌ Mission insert error:', missionError);
    return;
  }

  const missionId = missionData[0].id;

  // 3. Link mission to objectives
  for (const obj of insertedObjectives) {
    const { error } = await supabase.from('mission_objectives').insert([
      {
        mission_id: missionId,
        objective_id: obj.id
      }
    ]);
    if (error) console.error('❌ mission_objectives insert error:', error);
  }

  // 4. Insert problems with debug logging
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
    }
  }

  console.log(`✅ Mission inserted with ${insertedObjectives.length} objectives and ${problems.length} problems attempted.`);
}

run();
