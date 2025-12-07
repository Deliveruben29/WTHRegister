import { createClient } from '@supabase/supabase-js';

// Estos valores vendrán de tu configuración de proyecto
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase vars missing. Check your .env or Render environment variables.');
}

// Fallback to avoid crash during build or if keys are missing
const isValid = supabaseUrl && supabaseAnonKey;

export const supabase = isValid
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
