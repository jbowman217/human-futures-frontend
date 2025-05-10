import fs from 'fs';
import path from 'path';

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
  id?: string;
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

function mergeMaterialsIntoMissions() {
  const materialsPath = path.join(process.cwd(), 'materials.json');
  const missionsDir = path.join(process.cwd(), 'fused_missions');

  if (!fs.existsSync(materialsPath)) {
    console.error('❌ materials.json not found.');
    return;
  }

  const materialsData: Record<string, Material[]> = JSON.parse(fs.readFileSync(materialsPath, 'utf-8'));
  const missionFiles = fs.readdirSync(missionsDir);

  const normalizedFiles = missionFiles.reduce((map, file) => {
    const raw = file.replace(/^mission_/, '').replace(/\.json$/, '');
    map.set(normalize(raw), file);
    return map;
  }, new Map<string, string>());

  for (const [missionKey, materials] of Object.entries(materialsData)) {
    const normKey = normalize(missionKey);
    const missionFilename = normalizedFiles.get(normKey);

    if (!missionFilename) {
      console.warn(`⚠️ No matching mission file for: "${missionKey}"`);
      continue;
    }

    const missionPath = path.join(missionsDir, missionFilename);
    const missionData: Mission = JSON.parse(fs.readFileSync(missionPath, 'utf-8'));

    if (!Array.isArray(missionData.tasks) || missionData.tasks.length < 1) {
      console.warn(`⚠️ Mission "${missionData.title}" has no valid tasks.`);
      continue;
    }

    // Clear any existing materials from tasks
    missionData.tasks = missionData.tasks.map(t => ({ ...t, materials: [] }));

    // Assign materials by task index
    for (const material of materials) {
      const taskIndex = extractTaskIndex(material.link);
      if (taskIndex === null || !missionData.tasks[taskIndex]) {
        console.warn(`❌ Skipped material: ${material.link} — no valid task index.`);
        continue;
      }
      missionData.tasks[taskIndex].materials?.push(material);
    }

    // Optional: sort materials per task
    missionData.tasks.forEach(task => {
      if (task.materials) {
        task.materials.sort((a, b) => a.link.localeCompare(b.link));
      }
    });

    // Write updated mission
    fs.writeFileSync(missionPath, JSON.stringify(missionData, null, 2));
    console.log(`✅ Materials merged into ${missionFilename}`);
  }

  console.log('🚀 All mission files updated with embedded task materials.');
}

mergeMaterialsIntoMissions();
