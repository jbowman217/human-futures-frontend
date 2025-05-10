// app/lib/supabase.ts

const SUPABASE_URL = 'https://gczngzmrkaeqtcwzevcl.supabase.co'; // ✅ Use your actual Supabase project URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjem5nem1ya2FlcXRjd3pldmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzIzMTUsImV4cCI6MjA2MDc0ODMxNX0.N_6tL2UqSvtZCAQaZ0lWOLiwGGbf-Ocko-SroWEkjys'; // ✅ Use your anon public key

export async function fetchMissions() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/missions?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Failed to fetch missions:', errorText);
    return [];
  }

  return await res.json();
}

export async function submitStudentThoughts(
  mission_id: string,
  user_id: string,
  thoughts: string,
  questions: string
) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/student_thoughts`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ mission_id, user_id, thoughts, questions }),
  });

  return res.ok;
}

export async function submitStudentResponse(
  mission_id: string,
  user_id: string,
  solution: string,
  reflection: string
) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/responses`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ mission_id, user_id, solution, reflection }),
  });

  return res.ok;
}
