/**
 * Punto de Entrada de la Aplicación Modular (EduGest App).
 * Este módulo orquestra el ciclo de vida inicial del sistema: hidratación de datos,
 * enrutamiento inicial y desactivación de la pantalla de carga (splash).
 */

import { S } from './state.js';
import { hydrate, clearBrowserSession, applySessionUser, hydrateLocalWorkspaceForUser } from './hydration.js';
import { go, readPanelLocation } from './routing.js';
import '../panels/autenticacion/principal.js';

/**
 * Función de arranque principal de la aplicación.
 * Realiza la carga de datos desde almacenamiento local, resuelve la página de inicio
 * y notifica al sistema que el arranque ha finalizado.
 * @returns {Promise<void>}
 */
export async function boot() {
  console.log('[EduGest] Iniciando aplicación modular...');
  
  // 1. Hidratación inicial del estado desde LocalStorage/DB
  await hydrate();
  
  // Sincronizar UI tras carga de datos
  if (typeof window.updateSBUser === 'function') window.updateSBUser();
  if (typeof window.refreshTop === 'function') window.refreshTop();
  
  // 2. Determinación de la página inicial (URL > Estado > Default)
  const urlLocation = readPanelLocation(S.currentPage, S.activityViewMode);
  const urlParams = new URLSearchParams(window.location.search);
  
  const page = urlLocation?.requestedPage || urlParams.get('p') || S.currentPage || 'tablero';
  
  console.debug(`[EduGest][boot] Página resuelta para arranque: ${page}`);
  
  // 3. Inicio de la navegación al panel correspondiente
  go(page, { replace: true });
  
  // 4. Ocultar pantalla de bienvenida (Splash Screen) una vez listo
  if (typeof window.hideBootSplash === 'function') {
    window.hideBootSplash('boot_complete');
  }

  // 5. Verificación post-boot: Resiliencia de sesión
  //    Si no hay sesión en S pero SÍ hay un token en el navegador, evitamos borrarlo
  //    para permitir recuperación en el siguiente ciclo o via Cloud.
  const browserSession = typeof window.readBrowserSession === 'function' 
    ? window.readBrowserSession() 
    : null;
  const browserSessionIdentity = browserSession?.uid
    ? {
        id: browserSession.uid,
        uid: browserSession.uid,
        name: browserSession.name || '',
        email: '',
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

  if (!S.sessionUserId && !browserSession?.uid) {
    console.warn('[EduGest][boot] Sin sesión detectada, limpiando rastro local.');
    clearBrowserSession(); 
    
    window.setTimeout(() => {
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
  } else if (!S.sessionUserId && browserSession?.uid) {
    console.debug('[EduGest][boot] Sesión latente detectada en storage pero no hidratada en S.');
  }
}

// Globalización para permitir el arranque desde index.html
window.EduGestApp = { boot };
