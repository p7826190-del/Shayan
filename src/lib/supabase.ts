import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing in environment variables.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export type ProfileRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: ProfileRole;
  phone_number?: string;
  country?: string;
  gender?: string;
  teams_id?: string;
  created_at: string;
}
