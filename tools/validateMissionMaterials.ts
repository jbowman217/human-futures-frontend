import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// ✅ Define material interface
interface Material {
  link?: string;
  type?: string;
  description?: string;
}

// ✅ Connect to Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function validateMissionMaterials() {
  const { data: missions, error } = await supabase
    .from('missions')
    .select('id, title, tasks');

  if (error || !missions) {
    console.error('❌ Failed to fetch missions:', error);
    return;
  }

  let missionPassCount = 0;
  let missionFailCount = 0;
  let totalTasks = 0;
  let tasksWithMissing = 0;
  let malformedLinks = 0;

  console.log('\n🔍 VALIDATION REPORT:\n');

  for (const mission of missions) {
    const { title, tasks } = mission;

    if (!Array.isArray(tasks) || tasks.length !== 3) {
      console.warn(`❌ ${title} has invalid or missing tasks.`);
      missionFailCount++;
      continue;
    }

    let missionHasAll = true;

    tasks.forEach((task: { materials?: Material[] }, taskIndex: number) => {
      totalTasks++;

      if (!Array.isArray(task.materials) || task.materials.length === 0) {
        console.warn(`⚠️ ${title} — Task ${taskIndex + 1} has no materials.`);
        missionHasAll = false;
        tasksWithMissing++;
        return;
      }

      // ✅ FIX: Add type to `mat`
      const badLinks = task.materials.filter((mat: Material) =>
        !mat.link ||
        typeof mat.link !== 'string' ||
        !mat.link.startsWith('/materials/') ||
        !/\.(png|jpe?g|svg|pdf|md|txt|mp4|csv)$/i.test(mat.link)
      );

      if (badLinks.length > 0) {
        malformedLinks += badLinks.length;
        console.warn(
          `⚠️ ${title} — Task ${taskIndex + 1} has ${badLinks.length} bad material link(s).`
        );
        missionHasAll = false;
      }
    });

    if (missionHasAll) {
      console.log(`✅ ${title} — All 3 tasks passed.`);
      missionPassCount++;
    } else {
      missionFailCount++;
    }
  }

  console.log('\n🧾 SUMMARY:');
  console.log(`✅ Passed: ${missionPassCount}`);
  console.log(`❌ Failed: ${missionFailCount}`);
  console.log(`📦 Tasks Checked: ${totalTasks}`);
  console.log(`⚠️ Tasks Missing Materials: ${tasksWithMissing}`);
  console.log(`❌ Malformed Links: ${malformedLinks}`);
  console.log('\n🎯 Validation complete.\n');
}

validateMissionMaterials();
