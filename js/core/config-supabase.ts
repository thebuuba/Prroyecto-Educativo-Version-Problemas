/**
 * Configuracion publica de Supabase para EduGest.
 * La anon key es publica; nunca pongas aqui service_role ni claves secretas.
 */
const env = import.meta.env || {};

export const EDUGEST_SUPABASE_CONFIG = {
  url: String(env.VITE_SUPABASE_URL || window.EDUGEST_SUPABASE_CONFIG?.url || '').trim(),
  anonKey: String(env.VITE_SUPABASE_ANON_KEY || window.EDUGEST_SUPABASE_CONFIG?.anonKey || '').trim(),
};
