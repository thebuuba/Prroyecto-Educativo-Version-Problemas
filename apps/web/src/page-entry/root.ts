/**
 * Punto de Entrada Raíz de EduGest (The Bridge).
 * --------------------------------------------------------------------------
 * Este archivo actúa como el puente universal entre la arquitectura modular 
 * moderna (ES Modules) y los componentes legados que aún dependen del 
 * ámbito global `window`.
 * 
 * Responsabilidades:
 * 1. Cargar el puente de compatibilidad legacy.
 * 2. Inicializar shell y manejadores globales.
 * 3. Orquestar el ciclo de arranque (Boot).
 */

import { boot } from '../../../../js/core/app.ts';
import { initShell } from '../../../../js/core/shell.ts';
import { initDeleters } from '../../../../js/core/deleters.ts';
import { loadedPanelBundles } from '../../../../js/core/routing.ts';
import { registerDefaultModals } from '../../../../js/core/modal-loader.ts';
import { bindDeclarativeActions } from '../../../../js/core/declarative-actions.ts';
import { mountAuthFragments } from '../../../../login-registro-auth/auth-loader.js';
import {
  installPersistGuards,
  registerLegacyBridge,
  registerPanelRenderer,
} from '../../../../js/core/legacy-bridge.ts';
import { inicializar as inicializarAuth } from '../../../../js/panels/autenticacion/principal.ts';
import { inicializar as inicializarSetup } from '../../../../js/panels/configuracion-inicial/principal.ts';
import { inicializar as inicializarTablero } from '../../../../js/panels/tablero/principal.ts';

// Inicializar paneles críticos inmediatamente
try {
  inicializarAuth();
} catch (error) {
  console.error('[EduGest] Error inicializando panel de autenticación:', error);
}

try {
  inicializarSetup();
} catch (error) {
  console.error('[EduGest] Error inicializando panel de configuración inicial:', error);
}

try {
  inicializarTablero();
  loadedPanelBundles.dashboard = true;
  loadedPanelBundles.tablero = true;
} catch (error) {
  console.error('[EduGest] Error inicializando panel de tablero:', error);
}

installPersistGuards();
registerLegacyBridge();
registerPanelRenderer();

/**
 * Inicialización principal al cargar el DOM.
 * Gestiona el arranque de los subsistemas y la hidratación de datos.
 */
function startEduGest() {
  registerDefaultModals();
  mountAuthFragments();
  bindDeclarativeActions();

  // Inicializar componentes del shell (Sidebars, Modales, Tooltips)
  initShell();
  
  // Inicializar manejadores de eliminación (confirmaciones globales)
  initDeleters();

  // Ejecutar el orquestador de arranque (Hidratación, Auth, Sincronización)
  boot().catch(err => {
    console.error('[EduGest][boot] Fallo crítico durante el arranque:', err);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startEduGest);
} else {
  startEduGest();
}
