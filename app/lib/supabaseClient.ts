// /app/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Throw error if missing env variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Missing Supabase environment variables. Check your .env.local file.');
}

// Export configured Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
