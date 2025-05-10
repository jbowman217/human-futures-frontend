import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Material {
  title: string;
  link: string;
  description?: string;
}

interface Task {
  task_text: string;
  hint: string;
  materials: Material[];
}

const fallbackTasks: Task[] = [
  {
    task_text: "Complete mission activities",
    hint: "Follow the provided materials",
    materials: []
  },
  {
    task_text: "Analyze findings",
    hint: "Document your observations",
    materials: []
  },
  {
    task_text: "Design solution",
    hint: "Apply what you've learned",
    materials: []
  }
];

const materialsPath = path.join(process.cwd(), 'materials_by_title.json');
const materialsByTitle: Record<string, Material[]> = JSON.parse(fs.readFileSync(materialsPath, 'utf-8'));

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function distributeMaterialsToTasks() {
  const { data: missions, error } = await supabase.from('missions').select('id, title, tasks');

  if (error || !missions) {
    console.error('❌ Failed to fetch missions:', error);
    return;
  }

  for (const [titleKey, materials] of Object.entries(materialsByTitle)) {
    const match = missions.find((m) => normalize(m.title).includes(normalize(titleKey)));

    if (!match) {
      console.warn(`⚠️ No match found for title key: "${titleKey}"`);
      continue;
    }

    const missionId = match.id;
    const missionTitle = match.title;
    let taskSet: Task[];

    if (!Array.isArray(match.tasks)) {
      console.warn(`⚠️ "${missionTitle}" had invalid or missing tasks. Using fallback structure.`);
      taskSet = fallbackTasks.map((task) => ({ ...task }));
    } else {
      taskSet = match.tasks.map((task: any) => ({
        ...task,
        materials: Array.isArray(task.materials) ? [...task.materials] : []
      }));
    }

    const numTasks = taskSet.length;
    const chunkSize = Math.ceil(materials.length / Math.max(1, numTasks));

    for (let i = 0; i < numTasks; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      taskSet[i].materials = materials.slice(start, end);
    }

    const { error: updateError } = await supabase
      .from('missions')
      .update({ tasks: taskSet })
      .eq('id', missionId);

    if (updateError) {
      console.error(`❌ Failed to update "${missionTitle}":`, updateError);
    } else {
      console.log(`✅ Synced ${materials.length} materials across ${numTasks} tasks for "${missionTitle}"`);
    }
  }

  console.log('🚀 Live material sync complete.');
}

distributeMaterialsToTasks();
