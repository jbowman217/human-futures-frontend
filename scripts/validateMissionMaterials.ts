import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

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

    tasks.forEach((task, taskIndex) => {
      totalTasks++;

      if (!Array.isArray(task.materials) || task.materials.length === 0) {
        console.warn(`⚠️ ${title} — Task ${taskIndex + 1} has no materials.`);
        missionHasAll = false;
        tasksWithMissing++;
        return;
      }

      const badLinks = (task.materials as { link: string }[]).filter(
        (mat: { link: string }) =>
          !mat.link ||
          typeof mat.link !== 'string' ||
          !mat.link.startsWith('/materials/') ||
          !/\.(png|jpg|jpeg|svg|pdf|md|txt|mp4|csv)$/i.test(mat.link)
      );
      
      );

      if (badLinks.length > 0) {
        malformedLinks += badLinks.length;
        console.warn(
          `⚠️ ${title} — Task ${taskIndex + 1} contains ${badLinks.length} malformed material link(s).`
        );
        missionHasAll = false;
      }
    });

    if (missionHasAll) {
      console.log(`✅ ${title} — All 3 tasks passed material validation.`);
      missionPassCount++;
    } else {
      missionFailCount++;
    }
  }

  console.log('\n🧾 SUMMARY:');
  console.log(`✅ Missions Passed: ${missionPassCount}`);
  console.log(`❌ Missions with Issues: ${missionFailCount}`);
  console.log(`📦 Tasks Checked: ${totalTasks}`);
  console.log(`⚠️ Tasks Missing Materials: ${tasksWithMissing}`);
  console.log(`❌ Malformed Material Links: ${malformedLinks}`);
  console.log('\n🎯 Material validation complete.\n');
}

validateMissionMaterials();
