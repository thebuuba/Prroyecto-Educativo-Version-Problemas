/**
 * Script de inicialización de autenticación simple.
 * Carga las funciones de autenticación directamente para asegurar que estén disponibles.
 */

console.log('[AUTH-INIT] Iniciando carga de funciones de autenticación...');

// Importar el panel de autenticación
import { inicializar as inicializarAuth } from './panels/autenticacion/principal.js';
import { inicializar as inicializarSetup } from './panels/configuracion-inicial/principal.js';

console.log('[AUTH-INIT] Paneles importados, inicializando...');

try {
  inicializarAuth();
  console.log('[AUTH-INIT] Panel de autenticación inicializado');
} catch (error) {
  console.error('[AUTH-INIT] Error inicializando auth:', error);
}

try {
  inicializarSetup();
  console.log('[AUTH-INIT] Panel de configuración inicial inicializado');
} catch (error) {
  console.error('[AUTH-INIT] Error inicializando setup:', error);
}

console.log('[AUTH-INIT] Inicialización completada');