/**
 * Verifica si la depuración de sesión está habilitada vía URL o LocalStorage.
 * @returns {boolean}
 */
export function isSessionDebugEnabled() {
  try {
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('debugSession') === '1') return true;
    const flag = String(window.localStorage.getItem('eg_v3:debug-session') || '').trim();
    return flag === '1' || flag.toLowerCase() === 'true';
  } catch (_) {
    return false;
  }
}

/**
 * Verifica si la depuración de autenticación está habilitada.
 * @returns {boolean}
 */
export function isAuthDebugEnabled() {
  try {
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('debugAuth') === '1') return true;
    const flag = String(window.localStorage.getItem('eg_v3:debug-auth') || '').trim();
    return flag === '1' || flag.toLowerCase() === 'true';
  } catch (_) {
    return false;
  }
}

/**
 * Registra un evento de depuración de sesión en la consola si está habilitado.
 */
export function debugSessionFlow(event, payload = {}) {
  if (!isSessionDebugEnabled()) return;
  try {
    console.info(`[EduGest][session-debug] ${event}`, payload);
  } catch (_) {}
}

/**
 * Registra un evento de depuración de autenticación en la consola si está habilitado.
 */
export function debugAuthFlow(event, payload = {}) {
  if (!isAuthDebugEnabled()) return;
  try {
    console.info(`[EduGest][auth-debug] ${event}`, payload);
  } catch (_) {}
}
