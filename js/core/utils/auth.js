/**
 * Normaliza una dirección de correo electrónico para usarla como llave de búsqueda.
 * @param {string} email - Correo fuente.
 * @returns {string}
 */
export function authEmailKey(email) {
  return String(email || '').trim().toLowerCase();
}

/**
 * Formatea una duración en milisegundos a un formato de mm:ss para visualización.
 * @param {number} ms - Milisegundos.
 * @returns {string} Ej: "5m 30s".
 */
export function formatMsToMinSec(ms = 0) {
  const safeMs = Math.max(0, Number(ms) || 0);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (!minutes) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

/**
 * Valida y normaliza el modo de acceso de autenticación (Google, Facebook, Email, etc).
 * @param {string} mode - Modo de entrada.
 * @returns {string} Modo válido o cadena vacía.
 */
export function normalizeAuthAccessMode(mode) {
  const value = String(mode || '').trim().toLowerCase();
  const valid = ['google', 'facebook', 'local', 'email', 'supabase'];
  return valid.includes(value) ? value : '';
}

/**
 * Verifica si los servicios de autenticación en la nube están disponibles y configurados.
 * @returns {boolean}
 */
export function canUseCloudAuth() {
  return !!window.EduGestCloud?.isConfigured?.();
}

/**
 * Determina si el sistema debe intentar autenticación local tras un fallo en la nube.
 * @param {Error} error - Error capturado de la nube.
 * @returns {boolean}
 */
export function shouldFallbackToLocalAuth(error) {
  const code = String(error?.code || '').trim();
  const fallbackCodes = new Set([
    'auth/configuration-not-found',
    'auth/operation-not-allowed',
    'auth/network-request-failed',
    'network_error',
    'fetch_failed',
  ]);
  return fallbackCodes.has(code);
}
