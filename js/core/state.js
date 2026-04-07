/**
 * Gestión del Estado Global Reactivo de EduGest.
 * Este módulo centraliza el estado de la aplicación, flags de sincronización,
 * filtros de búsqueda y estados de flujos de usuario (onboarding, términos, etc.).
 */

import { createInitialState } from './config.js';

/**
 * @typedef {Object} GlobalState
 * @property {Array} estudiantes - Lista de estudiantes cargados.
 * @property {Array} secciones - Lista de materias/secciones.
 * @property {Object} profile - Perfil del usuario actual.
 * @property {string} sessionUserId - ID del usuario en Firebase Auth.
 * @property {Object} preferences - Preferencias de usuario (modo oscuro, densidad, etc.).
 */

/**
 * Estado Global Reactivo (S).
 * Contiene toda la información de la sesión, configuración, grados, estudiantes, etc.
 * Se expone a window.S para mantener compatibilidad con el código administrativo (App Shell).
 * @type {GlobalState}
 */
export const S = createInitialState();

/**
 * Actualiza parcialmente el estado global fusionando el nuevo valor.
 * @param {Partial<GlobalState>} val - Objeto con las propiedades a actualizar.
 */
export function setS(val) { Object.assign(S, val); }
window.S = S;

/** 
 * Indica si el estado ha sido hidratado desde la nube (Firestore).
 * @type {boolean} 
 */
export let cloudStateHydrated = false;
export function setCloudStateHydrated(val) { cloudStateHydrated = val; }

/** 
 * Almacena la función de desuscripción de la escucha en tiempo real de Firestore.
 * @type {Function|null} 
 */
export let cloudStateUnsubscribe = null;
export function setCloudStateUnsubscribe(val) { cloudStateUnsubscribe = val; }

/** 
 * Flag para evitar bucles durante la aplicación de cambios remotos de Firestore.
 * @type {boolean} 
 */
export let isApplyingRemoteCloudState = false;
export function setIsApplyingRemoteCloudState(val) { isApplyingRemoteCloudState = val; }

/** 
 * Silencia temporalmente el guardado automático en la nube.
 * @type {boolean} 
 */
export let suppressCloudStateSave = false;
export function setSuppressCloudStateSave(val) { suppressCloudStateSave = val; }

/** 
 * Filtro activo en el panel de instrumentos (Rúbricas/Cotejo).
 * @type {string} 
 */
export let INSTRUMENT_FILTER = 'all';
export function setInstrumentFilter(val) { INSTRUMENT_FILTER = val; }

/** 
 * Filtros de búsqueda para la biblioteca de instrumentos.
 * @type {{ gradeId: string, type: string, subject: string, periodId: string }} 
 */
export let INSTRUMENT_LIBRARY_FILTERS = { gradeId: '', type: '', subject: '', periodId: '' };
export function setInstrumentLibraryFilters(val) { INSTRUMENT_LIBRARY_FILTERS = val; }

/** 
 * Estado del menú de descarga de instrumentos.
 * @type {{ openId: string|null, root: HTMLElement|null }}
 */
export const INSTRUMENT_DOWNLOAD_MENU = { openId: null, root: null };

/** 
 * ID del temporizador para el debounce del guardado persistente (localStorage/Cloud).
 * @type {number|null} 
 */
export let persistDebounceTimer = null;
export function setPersistDebounceTimer(val) { persistDebounceTimer = val; }

/** 
 * Indica si hay una operación de persistencia pendiente de ejecución.
 * @type {boolean} 
 */
export let persistPending = false;
export function setPersistPending(val) { persistPending = val; }

/** 
 * Mantiene la selección del mes en el panel de asistencia aunque cambie el contexto.
 * @type {boolean} 
 */
export let attendanceMonthPinned = false;
export function setAttendanceMonthPinned(val) { attendanceMonthPinned = val; }

/** 
 * Token incremental para disparar re-renderizados de componentes en paneles legados.
 * @type {number} 
 */
export let panelEnhancementToken = 0;
export function incrementPanelEnhancementToken() { panelEnhancementToken++; }

/** 
 * Caché de optimización para el listado de estudiantes (roster).
 */
export const STUDENT_ROSTER_CACHE = {
  token: '',
  rosterStudents: new Map(),
};

/** 
 * Estado del flujo de configuración inicial (Selección de Nivel Educativo).
 */
export const SETUP_FLOW = {
  educationSection: '',
  educationSections: [],
  educationSectionConfirmed: false,
  educationSectionLocked: false,
  educationSectionStep: 'select',
};

/** 
 * Contexto para el modal de sección educativa.
 */
export const EDUCATION_SECTION_MODAL_CONTEXT = {
  fromAuth: false,
};

/** 
 * Estado del flujo de aceptación de Términos y Condiciones.
 */
export const TERMS_ACCEPTANCE_FLOW = {
  openSetupAfterAccept: false,
  revokeOnDecline: false,
};

/** 
 * Estado del flujo de verificación de dispositivo (Seguridad).
 */
export const DEVICE_VERIFICATION_FLOW = {
  pendingUser: null,
  pendingAfterLogin: false,
  pendingMaskedEmail: '',
  pendingSource: 'login',
};


