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
  link: string;
  type: string;
  description: string;
}

interface Task {
  task_text: string;
  hint?: string;
  materials?: Material[];
}

interface MissionExport {
  id: string;
  title: string;
  tasks: Task[];
}

function stripMaterials(tasks: Task[]): Task[] {
  return tasks.map(({ task_text, hint }) => ({ task_text, hint }));
}

async function exportTasks() {
  const args = process.argv.slice(2);
  const strip = args.includes('--strip-materials');
  const outputFile = args.find(arg => arg.startsWith('--out='))?.split('=')[1] || 'exported_tasks.json';

  const { data: missions, error } = await supabase
    .from('missions')
    .select('id, title, tasks');

  if (error || !missions) {
    console.error('❌ Failed to fetch missions:', error);
    return;
  }

  const output: MissionExport[] = missions.map(m => ({
    id: m.id,
    title: m.title,
    tasks: strip ? stripMaterials(m.tasks) : m.tasks
  }));

  const outputPath = path.join(process.cwd(), outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`✅ Exported ${missions.length} missions to ${outputFile}`);
}

exportTasks();
