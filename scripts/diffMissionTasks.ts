import fs from 'fs';
import path from 'path';

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

interface Mission {
  id: string;
  title: string;
  tasks: Task[];
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function loadJSON(filePath: string): Mission[] {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`❌ File not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

function compareTasks(a: Task[], b: Task[], checkMaterials: boolean): string[] {
  const diffs: string[] = [];
  if (a.length !== b.length) {
    diffs.push(`❗ Task count mismatch: ${a.length} vs. ${b.length}`);
    return diffs;
  }

  a.forEach((taskA, idx) => {
    const taskB = b[idx];
    if (taskA.task_text !== taskB.task_text) {
      diffs.push(`🔤 Task ${idx + 1} text mismatch.`);
    }
    if ((taskA.hint || '') !== (taskB.hint || '')) {
      diffs.push(`💡 Task ${idx + 1} hint mismatch.`);
    }
    if (checkMaterials) {
      const matA = taskA.materials || [];
      const matB = taskB.materials || [];
      if (matA.length !== matB.length) {
        diffs.push(`📦 Task ${idx + 1} has different material counts.`);
      }
    }
  });

  return diffs;
}

function diffMissions(source: Mission[], target: Mission[], checkMaterials = false): void {
  const normalizedTargetMap = new Map(target.map(m => [normalize(m.title), m]));

  let differences = 0;

  for (const src of source) {
    const normTitle = normalize(src.title);
    const tgt = normalizedTargetMap.get(normTitle);
    if (!tgt) {
      console.warn(`❌ Missing in target: "${src.title}"`);
      differences++;
      continue;
    }

    const diffs = compareTasks(src.tasks, tgt.tasks, checkMaterials);
    if (diffs.length > 0) {
      console.log(`\n🔍 Differences for "${src.title}":`);
      diffs.forEach(d => console.log(`  - ${d}`));
      differences++;
    }
  }

  console.log(
    differences === 0
      ? '\n✅ No differences found between mission task sets.'
      : `\n❗ Found differences in ${differences} mission(s).`
  );
}

function main() {
  const args = process.argv.slice(2);
  const sourceFile = args[0];
  const targetFile = args[1];
  const checkMaterials = args.includes('--check-materials');

  if (!sourceFile || !targetFile) {
    console.error('Usage: tsx scripts/diffMissionTasks.ts source.json target.json [--check-materials]');
    process.exit(1);
  }

  const source = loadJSON(sourceFile);
  const target = loadJSON(targetFile);
  diffMissions(source, target, checkMaterials);
}

main();
