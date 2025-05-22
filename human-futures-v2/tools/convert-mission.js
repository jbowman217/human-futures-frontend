// tools/convert-mission.js
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const BASE_PATH = './src';

function readJson(filePath) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null;
}

function readMarkdown(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function convertLessonToSupabase(grade, module, lesson) {
  const folder = path.join(BASE_PATH, grade, module, lesson);

  const lessonJson = readJson(path.join(folder, 'lesson.json'));
  const rubric = readJson(path.join(folder, 'rubric.json')) || {};
  const llmPrompts = readJson(path.join(folder, 'llm_prompts.json')) || {};
  const remixPrompts = readJson(path.join(folder, 'remix_prompts.json'));
  const problems = readJson(path.join(folder, 'problems.json'));
  const missionMd = readMarkdown(path.join(folder, 'mission.md'));
  const reflectionPrompt = readMarkdown(path.join(folder, 'reflection.md'));

  const output = {
    id: uuidv4(),
    grade_band: grade.replace('grade', 'Grade '),
    module: module.replace('module', 'Module '),
    lesson: lesson.replace('lesson', 'Lesson '),
    course: 'Math',
    title: lessonJson?.objective || 'Untitled Mission',
    mission_type: 'core',
    learning_objectives: lessonJson?.objectives || [],
    skills: lessonJson?.skills || [],
    content: {
      lesson_json: lessonJson,
      mission_md: missionMd,
      remix_prompts: remixPrompts,
      problems: problems
    },
    rubric: rubric,
    llm_prompts: llmPrompts,
    reflection_prompt: llmPrompts?.reflection_prompt || reflectionPrompt,
    remix_prompt: llmPrompts?.remix_prompt || '',
    status: 'draft',
    created_at: new Date().toISOString()
  };

  const outPath = `./seeds/mission-${grade}-${module}-${lesson}.json`;
  fs.mkdirSync('./seeds', { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`✅ Created: ${outPath}`);
  return output;
}

// Modify below if you want to test other lessons
convertLessonToSupabase('grade6', 'module3', 'lesson11');
