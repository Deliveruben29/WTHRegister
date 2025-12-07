import { createClient } from '@supabase/supabase-js';

// Estos valores vendrán de tu configuración de proyecto
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase vars missing. Check your .env or Render environment variables.');
}

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);
