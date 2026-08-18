import { createClient } from '@supabase/supabase-js';

let rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Sanitizar la URL para eliminar automáticamente '/rest/v1' o barras al final si fueron agregadas en Render
export const supabaseUrl = rawUrl
  ? rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
  : '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('tu-proyecto')
);

if (isSupabaseConfigured) {
  console.log('✅ Supabase URL Sanitizada Conectada:', supabaseUrl);
} else {
  console.warn(
    '⚠️ Supabase no está activo en el build. URL:', 
    supabaseUrl ? supabaseUrl : '(vacio)'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
