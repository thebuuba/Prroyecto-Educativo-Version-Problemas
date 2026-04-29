/**
 * Punto de Entrada de la Aplicación Modular (EduGest App).
 * Este módulo orquestra el ciclo de vida inicial del sistema: hidratación de datos,
 * enrutamiento inicial y desactivación de la pantalla de carga (splash).
 */

import { S } from './state.js';
import * as CloudAuth from './api-cloud.js';
import {
  hydrate,
  clearBrowserSession,
  applySessionUser,
  hydrateCloudStateForUser,
  hydrateLocalWorkspaceForUser,
  readBrowserSession,
} from './hydration.js';
import { go, readPanelLocation } from './routing.js';

const OAUTH_RETURN_STORAGE_KEY = 'eg_v3:oauth-return';

function readOAuthReturnMarker() {
  try {
    return String(window.sessionStorage?.getItem?.(OAUTH_RETURN_STORAGE_KEY) || '').trim();
  } catch (_) {
    return '';
  }
}

function clearOAuthReturnMarker() {
  try {
    window.sessionStorage?.removeItem?.(OAUTH_RETURN_STORAGE_KEY);
  } catch (_) {
    // Ignorar navegadores con storage restringido.
  }
}

function isOAuthCallbackUrl() {
  try {
    const params = new URLSearchParams(window.location.search || '');
    return params.has('code')
      || params.has('state')
      || params.has('error')
      || params.has('error_description');
  } catch (_) {
    return false;
  }
}

function cleanOAuthCallbackUrl() {
  if (!isOAuthCallbackUrl()) return;
  try {
    window.history.replaceState(window.history.state || {}, '', `${window.location.origin}/inicio`);
  } catch (_) {
    // Si history no esta disponible, la navegacion normal se encarga de reemplazar la URL.
  }
}

/**
 * Función de arranque principal de la aplicación.
 * Realiza la carga de datos desde almacenamiento local, resuelve la página de inicio
 * y notifica al sistema que el arranque ha finalizado.
 * @returns {Promise<void>}
 */
export async function boot() {
  document.documentElement?.classList.add('auth-session-checking');
  const isReturningFromOAuth = Boolean(readOAuthReturnMarker()) || isOAuthCallbackUrl();
  
  // 1. Verificar si hay sesión de Supabase activa antes de hidratar
  let cloudUser = null;
  const getCloudUser = typeof window.EduGestCloud?.getCurrentUser === 'function'
    ? window.EduGestCloud.getCurrentUser
    : CloudAuth.getCurrentUser;

  if (typeof getCloudUser === 'function') {
    try {
      cloudUser = await getCloudUser();
    } catch (error) {
      console.warn('[EduGest][boot] Error al verificar usuario Supabase:', error);
    }
  }
  
  // 2. Hidratación inicial del estado desde LocalStorage/DB
  await hydrate();
  
  const browserSession = readBrowserSession();
  const browserSessionIdentity = browserSession?.uid
    ? {
        id: browserSession.uid,
        uid: browserSession.uid,
        name: browserSession.name || '',
        email: browserSession.email || '',
      }
    : null;

  if (!S.sessionUserId && browserSessionIdentity) {
    const localSessionUser = Array.isArray(S.authUsers)
      ? S.authUsers.find((entry) => entry.id === browserSessionIdentity.uid)
      : null;
    if (localSessionUser) {
      await hydrateLocalWorkspaceForUser(localSessionUser);
    } else {
      applySessionUser(browserSessionIdentity);
    }
  }
  
  // 3. Si hay usuario de Supabase, restaurar/sincronizar sesión local
  if (cloudUser && S.sessionUserId !== cloudUser.id) {
    await hydrateCloudStateForUser(cloudUser);
    
    // Sincronizar UI después de restaurar sesión
    if (typeof window.updateSBUser === 'function') window.updateSBUser();
    if (typeof window.refreshTop === 'function') window.refreshTop();
  } else {
    // Sincronizar UI normal si no hubo restauración
    if (typeof window.updateSBUser === 'function') window.updateSBUser();
    if (typeof window.refreshTop === 'function') window.refreshTop();
  }
  
  // 4. Determinación de la página inicial (URL > Estado > Default)
  const urlLocation = readPanelLocation(S.currentPage, S.activityViewMode);
  const urlParams = new URLSearchParams(window.location.search);
  
  const page = isReturningFromOAuth
    ? 'dashboard'
    : (urlLocation?.requestedPage || urlParams.get('p') || S.currentPage || 'dashboard');
  
  // 5. Solo navegar si hay sesión, si no, mostrar login
  const hasSession = S.sessionUserId || cloudUser;
  if (hasSession) {
    if (isReturningFromOAuth) {
      clearOAuthReturnMarker();
      cleanOAuthCallbackUrl();
    }

    // Cerrar modal de autenticación si está abierto
    const authModal = document.getElementById('m-auth');
    if (authModal) {
      if (typeof window.forceCloseM === 'function') {
        window.forceCloseM('m-auth');
      } else {
        authModal.classList.remove('open');
        authModal.style.setProperty('display', 'none', 'important');
        authModal.style.setProperty('pointer-events', 'none', 'important');
        document.body?.classList.remove('auth-screen-open');
      }
    }
    
    go(page, { replace: true, force: true });
    document.documentElement?.classList.remove('auth-session-checking');
  } else {
    showAuthModal();
  }
  
  // 6. Ocultar pantalla de bienvenida (Splash Screen) una vez listo
  if (typeof window.hideBootSplash === 'function') {
    window.hideBootSplash('boot_complete');
  }

  // 7. Verificación post-boot: Resiliencia de sesión
  //    Si no hay sesión en S pero SÍ hay un token en el navegador, evitamos borrarlo
  //    para permitir recuperación en el siguiente ciclo o via Cloud.
  if (!S.sessionUserId && !browserSession?.uid && !cloudUser) {
    console.warn('[EduGest][boot] Sin sesión detectada en ningún lugar, limpiando rastro local.');
    clearBrowserSession(); 
    showAuthModal();
  } else if (cloudUser && S.sessionUserId !== cloudUser.id) {
    await hydrateCloudStateForUser(cloudUser);
  }
}

function showAuthModal() {
  window.setTimeout(() => {
    document.documentElement?.classList.remove('auth-session-checking');
    const modal = document.getElementById('m-auth');
    if (modal && !modal.classList.contains('open')) {
      if (typeof window.openM === 'function') {
        window.openM('m-auth');
      } else {
        modal.classList.add('open');
        document.body?.classList.add('auth-screen-open');
      }
    }
  }, 150);
}

// Globalización para permitir el arranque desde index.html
window.EduGestApp = { boot };
