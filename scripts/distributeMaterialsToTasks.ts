import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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
  tasks: Task[] | string | null;
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function extractTaskIndex(link: string): number | null {
  const match = link.match(/task(\d)-/);
  return match ? parseInt(match[1], 10) - 1 : null;
}

function loadMaterialsMap(): Record<string, Material[]> {
  const materialsPath = path.join(process.cwd(), "materials_by_title.json");
  if (!fs.existsSync(materialsPath)) {
    throw new Error("❌ materials_by_title.json not found.");
  }
  const content = fs.readFileSync(materialsPath, "utf-8");
  return JSON.parse(content);
}

async function distributeMaterialsToTasks() {
  const materialsByTitle = loadMaterialsMap();

  const { data: missions, error } = await supabase
    .from("missions")
    .select("id, title, tasks");

  if (error || !missions) {
    console.error("❌ Failed to fetch missions:", error);
    return;
  }

  for (const [title, materials] of Object.entries(materialsByTitle)) {
    const match = missions.find((m) =>
      normalize(m.title).includes(normalize(title))
    );

    if (!match) {
      console.warn(`⚠️ No mission found for title: "${title}"`);
      continue;
    }

    if (!Array.isArray(match.tasks)) {
      console.warn(`⚠️ Skipping "${match.title}" — tasks field is not an array.`);
      continue;
    }

    const updatedTasks: Task[] = match.tasks.map((task) => ({
      ...task,
      materials: [],
    }));

    let unassignedCount = 0;

    for (const material of materials) {
      const taskIndex = extractTaskIndex(material.link);
      if (
        taskIndex === null ||
        taskIndex < 0 ||
        taskIndex >= updatedTasks.length
      ) {
        console.warn(
          `⚠️ Could not assign material "${material.link}" — invalid task index.`
        );
        unassignedCount++;
        continue;
      }

      updatedTasks[taskIndex].materials!.push(material);
    }

    updatedTasks.forEach((task, i) => {
      task.materials?.sort((a, b) => a.link.localeCompare(b.link));
      if (!task.materials || task.materials.length === 0) {
        console.warn(
          `⚠️ Task ${i + 1} in "${match.title}" has no assigned materials.`
        );
      }
    });

    const { error: updateError } = await supabase
      .from("missions")
      .update({ tasks: updatedTasks })
      .eq("id", match.id);

    if (updateError) {
      console.error(`❌ Failed to update "${match.title}":`, updateError);
    } else {
      console.log(
        `✅ Updated "${match.title}" — ${materials.length} materials assigned across ${updatedTasks.length} tasks.`
      );
      if (unassignedCount > 0) {
        console.log(
          `⚠️ ${unassignedCount} materials were unassigned due to missing or incorrect task index.`
        );
      }
    }
  }

  console.log("\n🚀 Task material distribution complete.");
}

distributeMaterialsToTasks();
