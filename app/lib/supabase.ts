// /app/lib/supabase.ts
const SUPABASE_URL = 'https://gczngzmrkaeqtcwzevcl.supabase.co';
const SUPABASE_KEY = 'your_anon_key';

export async function fetchMissions() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/missions?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.ok ? res.json() : [];
}

export async function submitStudentThoughts(mission_id, user_id, thoughts, questions) {
  return fetch(`${SUPABASE_URL}/rest/v1/student_thoughts`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ mission_id, user_id, thoughts, questions }),
  }).then(res => res.ok);
}

// ✅ NEW: curated thought submission
export async function submitCuratedThought(payload) {
  return fetch(`${SUPABASE_URL}/rest/v1/curated_thought_archive`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      ...payload,
      created_at: new Date().toISOString(),
    }),
  }).then(res => res.ok);
}
