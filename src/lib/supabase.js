// Cliente de Supabase.
// Las credenciales vienen del entorno (.env local o GitHub Secrets en CI).
// El anon key es PÚBLICO por diseño; la seguridad real está en las RLS policies.
// Si no hay credenciales, exportamos null y la app usa el fallback embebido.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseListo = Boolean(supabaseUrl && supabaseAnonKey);

// Solo crear el cliente si hay credenciales (evita el crash "supabaseUrl is required")
export const supabase = supabaseListo
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
