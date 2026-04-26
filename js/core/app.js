/**
 * Punto de Entrada de la Aplicación Modular (EduGest App).
 * Este módulo orquestra el ciclo de vida inicial del sistema: hidratación de datos,
 * enrutamiento inicial y desactivación de la pantalla de carga (splash).
 */

import { S } from './state.js';
import { hydrate, clearBrowserSession, applySessionUser, hydrateLocalWorkspaceForUser, readBrowserSession } from './hydration.js';
import { go, readPanelLocation } from './routing.js';

/**
 * Función de arranque principal de la aplicación.
 * Realiza la carga de datos desde almacenamiento local, resuelve la página de inicio
 * y notifica al sistema que el arranque ha finalizado.
 * @returns {Promise<void>}
 */
export async function boot() {
  console.log('[EduGest] Iniciando aplicación modular...');
  document.documentElement?.classList.add('auth-session-checking');
  
  // 1. Verificar si hay sesión de Firebase activa antes de hidratar
  let firebaseUser = null;
  if (typeof window.EduGestCloud?.getCurrentUser === 'function') {
    try {
      firebaseUser = await window.EduGestCloud.getCurrentUser();
      console.log('[EduGest][boot] Usuario Firebase detectado:', firebaseUser?.uid);
    } catch (error) {
      console.warn('[EduGest][boot] Error al verificar usuario Firebase:', error);
    }
  }
  
  // 2. Hidratación inicial del estado desde LocalStorage/DB
  await hydrate();
  
  console.log('[EduGest][boot] Estado después de hidratación:', {
    sessionUserId: S.sessionUserId,
    hasAuthUsers: Array.isArray(S.authUsers) && S.authUsers.length > 0,
    currentPage: S.currentPage,
    firebaseUser: firebaseUser?.uid
  });

  const browserSession = readBrowserSession();
  const browserSessionIdentity = browserSession?.uid
    ? {
        id: browserSession.uid,
        uid: browserSession.uid,
        name: browserSession.name || '',
        email: '',
      }
    : null;

  console.log('[EduGest][boot] Sesión del navegador:', {
    hasBrowserSession: !!browserSession,
    browserSessionUid: browserSession?.uid,
    browserSessionIdentity: !!browserSessionIdentity
  });

  if (!S.sessionUserId && browserSessionIdentity) {
    console.log('[EduGest][boot] Restaurando sesión desde navegador antes de pintar UI');
    const localSessionUser = Array.isArray(S.authUsers)
      ? S.authUsers.find((entry) => entry.id === browserSessionIdentity.uid)
      : null;
    if (localSessionUser) {
      await hydrateLocalWorkspaceForUser(localSessionUser);
    } else {
      applySessionUser(browserSessionIdentity);
    }
  }
  
  // 3. Si hay usuario de Firebase pero no sesión en S, restaurar sesión
  if (firebaseUser && !S.sessionUserId) {
    console.log('[EduGest][boot] Restaurando sesión desde Firebase...');
    const { hydrateCloudStateForUser } = await import('./hydration.js');
    await hydrateCloudStateForUser(firebaseUser);
    console.log('[EduGest][boot] Sesión restaurada desde Firebase:', S.sessionUserId);
    
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
  
  const page = urlLocation?.requestedPage || urlParams.get('p') || S.currentPage || 'dashboard';
  
  console.debug(`[EduGest][boot] Página resuelta para arranque: ${page}`);
  
  // 5. Solo navegar si hay sesión, si no, mostrar login
  const hasSession = S.sessionUserId || firebaseUser;
  if (hasSession) {
    console.log('[EduGest][boot] Hay sesión activa, navegando a página:', page);
    
    // Cerrar modal de autenticación si está abierto
    const authModal = document.getElementById('m-auth');
    if (authModal && authModal.classList.contains('open')) {
      console.log('[EduGest][boot] Cerrando modal de autenticación');
      if (typeof window.forceCloseM === 'function') {
        window.forceCloseM('m-auth');
      } else {
        authModal.classList.remove('open');
        document.body?.classList.remove('auth-screen-open');
      }
    }
    
    go(page, { replace: true });
    document.documentElement?.classList.remove('auth-session-checking');
  } else {
    console.log('[EduGest][boot] Sin sesión detectada, mostrando modal de autenticación');
    showAuthModal();
  }
  
  // 6. Ocultar pantalla de bienvenida (Splash Screen) una vez listo
  if (typeof window.hideBootSplash === 'function') {
    window.hideBootSplash('boot_complete');
  }

  // 7. Verificación post-boot: Resiliencia de sesión
  //    Si no hay sesión en S pero SÍ hay un token en el navegador, evitamos borrarlo
  //    para permitir recuperación en el siguiente ciclo o via Cloud.
  if (!S.sessionUserId && !browserSession?.uid && !firebaseUser) {
    console.warn('[EduGest][boot] Sin sesión detectada en ningún lugar, limpiando rastro local.');
    clearBrowserSession(); 
    showAuthModal();
  } else if (!S.sessionUserId && browserSession?.uid) {
    console.debug('[EduGest][boot] Sesión latente detectada en storage pero no hidratada en S.');
  } else if (firebaseUser && !S.sessionUserId) {
    console.log('[EduGest][boot] Firebase tiene sesión pero estado local no, intentando restauración...');
    // Intentar restaurar sesión de Firebase nuevamente
    const { hydrateCloudStateForUser } = await import('./hydration.js');
    await hydrateCloudStateForUser(firebaseUser);
  }
}

async function checkFirebaseSession() {
  try {
    if (typeof window.EduGestCloud?.getCurrentUser === 'function') {
      const user = await window.EduGestCloud.getCurrentUser();
      return !!user;
    }
    return false;
  } catch (error) {
    console.error('[EduGest][boot] Error verificando sesión de Firebase:', error);
    return false;
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
