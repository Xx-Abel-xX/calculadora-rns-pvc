// Cliente de Supabase.
// Las credenciales vienen del .env (no se suben a git).
// El anon key es PÚBLICO por diseño; la seguridad real está en las RLS policies.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Flag para saber si está configurado (si no, la app usa fallback)
export const supabaseListo = Boolean(supabaseUrl && supabaseAnonKey);
