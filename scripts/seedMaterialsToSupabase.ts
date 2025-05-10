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
  type: string;
  link: string;
  description: string;
}

interface Task {
  task_text: string;
  hint?: string;
  materials?: Material[];
}

interface Mission {
  id: string;
  title: string;
  tasks: Task[];
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractTaskIndex(link: string): number | null {
  const match = link.match(/task(\d)-/);
  return match ? parseInt(match[1], 10) - 1 : null;
}

async function seedMaterials() {
  const materialsPath = path.join(process.cwd(), 'materials_by_title.json');
  const materialsByTitle: Record<string, Material[]> = JSON.parse(fs.readFileSync(materialsPath, 'utf-8'));

  const { data: missions, error } = await supabase
    .from('missions')
    .select('id, title, tasks');

  if (error || !missions) {
    console.error('❌ Failed to fetch missions:', error);
    return;
  }

  for (const [title, materials] of Object.entries(materialsByTitle)) {
    const match = missions.find(m => normalize(m.title).includes(normalize(title)));

    if (!match) {
      console.warn(`⚠️ No mission found for title: "${title}"`);
      continue;
    }

    if (!Array.isArray(match.tasks) || match.tasks.length !== 3) {
      console.warn(`⚠️ Skipping "${match.title}" — tasks not valid or not exactly 3.`);
      continue;
    }

    const updatedTasks: Task[] = match.tasks.map(task => ({ ...task, materials: [] }));

    for (const material of materials) {
      const taskIndex = extractTaskIndex(material.link);
      if (taskIndex === null || taskIndex >= updatedTasks.length) {
        console.warn(`⚠️ Could not assign material: ${material.link}`);
        continue;
      }
      updatedTasks[taskIndex].materials!.push(material);
    }

    // Sort materials by filename for consistency
    updatedTasks.forEach(task => {
      task.materials?.sort((a, b) => a.link.localeCompare(b.link));
    });

    const { error: updateError } = await supabase
      .from('missions')
      .update({ tasks: updatedTasks })
      .eq('id', match.id);

    if (updateError) {
      console.error(`❌ Failed to update "${match.title}":`, updateError);
    } else {
      console.log(`✅ Seeded materials for "${match.title}"`);
    }
  }

  console.log('\n🚀 Supabase material seeding complete.');
}

seedMaterials();
