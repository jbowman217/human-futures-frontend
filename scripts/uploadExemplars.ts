import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Load the CSV file
const csvPath = path.join(process.cwd(), 'exemplars_fully_aligned.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const rows = parse(csvContent, {
  columns: true,
  skip_empty_lines: true
});

async function uploadExemplars() {
  let success = 0;
  let failed = 0;

  for (const row of rows) {
    const payload = {
      mission_id: row.mission_id,
      task_id: row.task_id,
      task_label: row.task_label,
      tier: row.tier,
      content: row.content,
      page_type: row.response_type, // 🔄 match your Supabase schema
      user_id: row.user_id,
      created_at: row.created_at
    };

    const { error } = await supabase.from('exemplars').insert(payload);

    if (error) {
      console.error(`❌ Failed to upload exemplar for task ${row.task_label}:`, error.message);
      failed++;
    } else {
      console.log(`✅ Uploaded exemplar for task ${row.task_label} (tier ${row.tier})`);
      success++;
    }
  }

  console.log(`\n🎯 Upload complete: ${success} succeeded, ${failed} failed.`);
}

uploadExemplars();
