import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using .env.local values
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Fetch exemplars for a given task_id from Supabase
 * @param task_id - string UUID for the task
 * @returns Array of exemplar objects
 */
export async function getExemplarsForTask(task_id: string) {
  const { data, error } = await supabase
    .from('exemplars')
    .select('*')
    .eq('task_id', task_id)
    .order('tier', { ascending: true });

  if (error) {
    console.error(`❌ Failed to fetch exemplars for task ${task_id}:`, error.message);
    return [];
  }

  return data;
}
