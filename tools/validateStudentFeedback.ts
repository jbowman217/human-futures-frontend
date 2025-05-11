import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function validateStudentFeedback() {
  const { data, error } = await supabase.from('student_feedback').select('*');

  if (error) {
    console.error('❌ Error fetching student feedback:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ No student feedback found.');
    return;
  }

  const report: Record<string, Record<string, number>> = {};

  for (const entry of data) {
    const mission = entry.mission_id || 'UNKNOWN_MISSION';
    const section = entry.page_type || 'UNKNOWN_SECTION';

    if (!report[mission]) report[mission] = {};
    if (!report[mission][section]) report[mission][section] = 0;

    report[mission][section]++;
  }

  console.log(`\n🧠 STUDENT FEEDBACK REPORT (${data.length} entries)\n`);
  for (const [mission, sections] of Object.entries(report)) {
    console.log(`📘 Mission: ${mission}`);
    for (const [section, count] of Object.entries(sections)) {
      console.log(`   • ${section}: ${count}`);
    }
    console.log('');
  }

  console.log('✅ Validation complete.\n');
}

validateStudentFeedback();
