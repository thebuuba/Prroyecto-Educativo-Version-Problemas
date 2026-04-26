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

console.log('[ROOT] Script root.js cargado - INICIO');

console.log('[ROOT] Importando módulos...');

import { boot } from '../core/app.js';
console.log('[ROOT] boot importado');

import { initShell } from '../core/shell.js';
console.log('[ROOT] initShell importado');

import { initDeleters } from '../core/deleters.js';
console.log('[ROOT] initDeleters importado');

import { mountAuthFragments } from '../../login-registro-auth/auth-loader.js';
console.log('[ROOT] mountAuthFragments importado');

import {
  installPersistGuards,
  registerLegacyBridge,
  registerPanelRenderer,
} from '../core/legacy-bridge.js';
console.log('[ROOT] legacy-bridge importado');

console.log('[ROOT] Importando panel de autenticación...');
import { inicializar as inicializarAuth } from '../panels/autenticacion/principal.js';
console.log('[ROOT] Panel de autenticación importado');

console.log('[ROOT] Importando panel de configuración inicial...');
import { inicializar as inicializarSetup } from '../panels/configuracion-inicial/principal.js';
console.log('[ROOT] Panel de configuración inicial importado');

console.log('[ROOT] Importando panel de tablero (dashboard)...');
import { inicializar as inicializarTablero } from '../panels/tablero/principal.js';
console.log('[ROOT] Panel de tablero importado');

console.log('[EduGest] Cargando punto de entrada raíz modular...');

// Inicializar paneles críticos inmediatamente
console.log('[EduGest] Inicializando panel de autenticación...');
try {
  inicializarAuth();
  console.log('[EduGest] Panel de autenticación inicializado correctamente');
} catch (error) {
  console.error('[EduGest] Error inicializando panel de autenticación:', error);
}

console.log('[EduGest] Inicializando panel de configuración inicial...');
try {
  inicializarSetup();
  console.log('[EduGest] Panel de configuración inicial inicializado correctamente');
} catch (error) {
  console.error('[EduGest] Error inicializando panel de configuración inicial:', error);
}

console.log('[EduGest] Inicializando panel de tablero (dashboard)...');
try {
  inicializarTablero();
  console.log('[EduGest] Panel de tablero inicializado correctamente');
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
