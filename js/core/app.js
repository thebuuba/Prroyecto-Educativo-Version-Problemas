/**
 * Punto de Entrada de la Aplicación Modular (EduGest App).
 * Este módulo orquestra el ciclo de vida inicial del sistema: hidratación de datos,
 * enrutamiento inicial y desactivación de la pantalla de carga (splash).
 */

import { S } from './state.js';
import { hydrate } from './hydration.js';
import { go } from './routing.js';
import '../panels/auth.js';

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
  
  // 2. Determinación de la página inicial (parámetro URL o estado persistido)
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('p') || S.currentPage || 'dashboard';
  
  // 3. Inicio de la navegación al panel correspondiente
  go(page, { replace: true });
  
  // 4. Ocultar pantalla de bienvenida (Splash Screen) una vez listo
  if (typeof window.hideBootSplash === 'function') {
    window.hideBootSplash('boot_complete');
  }
}

// Globalización para permitir el arranque desde index.html
window.EduGestApp = { boot };
