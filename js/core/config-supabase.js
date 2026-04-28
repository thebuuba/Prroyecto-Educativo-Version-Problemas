/**
 * Configuracion publica de Supabase para EduGest.
 * La anon key es publica; nunca pongas aqui service_role ni claves secretas.
 */
export const EDUGEST_SUPABASE_CONFIG = {
  url: import.meta.env?.VITE_SUPABASE_URL || window.EDUGEST_SUPABASE_CONFIG?.url || 'https://zxuscgenmwseruvcaafm.supabase.co',
  anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || window.EDUGEST_SUPABASE_CONFIG?.anonKey || '',
};
