import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function validateExemplars() {
  const { data: exemplars, error } = await supabase.from('exemplars').select('*');

  if (error) {
    console.error('❌ Error fetching exemplars:', error.message);
    return;
  }

  if (!exemplars || exemplars.length === 0) {
    console.warn('⚠️ No exemplars found in Supabase.');
    return;
  }

  const report: Record<string, Record<string, Record<string, number>>> = {};

  for (const ex of exemplars) {
    const mission = ex.mission_id || 'UNKNOWN_MISSION';
    const task = ex.task_label || 'UNKNOWN_TASK';
    const tier = ex.tier || 'Unspecified';

    if (!report[mission]) report[mission] = {};
    if (!report[mission][task]) report[mission][task] = {};
    if (!report[mission][task][tier]) report[mission][task][tier] = 0;

    report[mission][task][tier]++;
  }

  // Pretty print results
  for (const [mission, tasks] of Object.entries(report)) {
    console.log(`🧠 Mission: ${mission}`);
    for (const [task, tiers] of Object.entries(tasks)) {
      const summary = Object.entries(tiers)
        .map(([tier, count]) => `${tier}: ${count}`)
        .join(' | ');
      console.log(`  • ${task}: ${summary}`);
    }
    console.log('');
  }

  console.log(`✅ Validation complete. ${exemplars.length} total exemplars.`);
}

validateExemplars();
