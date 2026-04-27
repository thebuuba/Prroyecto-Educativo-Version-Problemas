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

import { boot } from '../core/app.js';
import { initShell } from '../core/shell.js';
import { initDeleters } from '../core/deleters.js';
import { mountAuthFragments } from '../../login-registro-auth/auth-loader.js';
import {
  installPersistGuards,
  registerLegacyBridge,
  registerPanelRenderer,
} from '../core/legacy-bridge.js';
import { inicializar as inicializarAuth } from '../panels/autenticacion/principal.js';
import { inicializar as inicializarSetup } from '../panels/configuracion-inicial/principal.js';
import { inicializar as inicializarTablero } from '../panels/tablero/principal.js';

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
  mountAuthFragments();

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
