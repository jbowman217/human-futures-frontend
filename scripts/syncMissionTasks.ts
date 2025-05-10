import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

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

interface MissionData {
  id: string;
  title: string;
  tasks: Task[];
}

function askForConfirmation(): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question('⚠️ This will overwrite all tasks for listed missions in Supabase.\nAre you sure you want to continue? (yes/no): ', answer => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
}

function stripMaterials(tasks: Task[]): Task[] {
  return tasks.map(({ task_text, hint }) => ({ task_text, hint }));
}

async function syncTasks() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const keepMaterials = args.includes('--with-materials');

  const jsonPath = path.join(process.cwd(), 'mvp_tasks.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ mvp_tasks.json not found.');
    return;
  }

  const missions: MissionData[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  if (!dryRun) {
    const confirmed = await askForConfirmation();
    if (!confirmed) {
      console.log('❌ Sync aborted by user.');
      return;
    }
  }

  for (const mission of missions) {
    const payloadTasks = keepMaterials ? mission.tasks : stripMaterials(mission.tasks);

    if (dryRun) {
      console.log(`📝 [DRY-RUN] Would update: "${mission.title}" with ${payloadTasks.length} tasks`);
      continue;
    }

    const { error } = await supabase
      .from('missions')
      .update({ tasks: payloadTasks })
      .eq('id', mission.id);

    if (error) {
      console.error(`❌ Failed to update "${mission.title}":`, error.message);
    } else {
      console.log(`✅ Updated: ${mission.title}`);
    }
  }

  console.log(dryRun ? '\n🧪 Dry-run complete.' : '\n🚀 All mission tasks synced.');
}

syncTasks();
