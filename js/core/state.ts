/**
 * Gestión del Estado Global Reactivo de EduGest.
 * Este módulo centraliza el estado de la aplicación y contenedores globales.
 */

// Inicialización de contenedores globales para compatibilidad y registro de paneles
window.RENDERS = window.RENDERS || {};

import { createInitialState } from './config.ts';

export type UnknownRecord = Record<string, unknown>;
export type Nullable<T> = T | null;
export type StoreUnsubscribe = (() => void) | null;

export interface InstrumentLibraryFilters {
  gradeId: string;
  type: string;
  subject: string;
  periodId: string;
}

export interface GlobalState {
  profile: Nullable<UnknownRecord>;
  grades: UnknownRecord[];
  secciones: UnknownRecord[];
  estudiantes: UnknownRecord[];
  studentDirectory: UnknownRecord[];
  actividades: UnknownRecord[];
  notas: UnknownRecord;
  lessonPlans: UnknownRecord[];
  lessonPlanDraft: Nullable<UnknownRecord>;
  lessonPlanUi: UnknownRecord;
  blockCfg: UnknownRecord;
  groupConfigs: UnknownRecord;
  templates: UnknownRecord[];
  instruments: UnknownRecord[];
  evaluations: UnknownRecord[];
  usuarios: UnknownRecord[];
  authUsers: UnknownRecord[];
  sessionUserId: Nullable<string>;
  sessionUserName: Nullable<string>;
  sessionStartedAt: Nullable<string>;
  sessionExpiresAt: Nullable<string>;
  cloudOwnerUid: Nullable<string>;
  schools: UnknownRecord[];
  schoolYear: UnknownRecord;
  academicCalendar: UnknownRecord;
  periods: UnknownRecord[];
  activePeriodId: string;
  periodGroupConfigs: UnknownRecord;
  notasByPeriod: UnknownRecord;
  attendance: UnknownRecord;
  teacherPlanner: UnknownRecord;
  activeGroupId: Nullable<string>;
  activeCourseId: Nullable<string>;
  currentPage: string;
  activityViewMode: string;
  aiChatHistory: UnknownRecord[];
  editingStudentId: Nullable<string>;
  preferences?: UnknownRecord;
  [key: string]: unknown;
}

/**
 * Estado Global Reactivo (S).
 * Contiene toda la información de la sesión, configuración, grados, estudiantes, etc.
 * Se expone a window.S para mantener compatibilidad con el código administrativo (App Shell).
 */
export const S = createInitialState() as GlobalState;

// Exposición global para compatibilidad
window.S = S;

/**
 * Actualiza parcialmente el estado global fusionando el nuevo valor.
 * @param {Partial<GlobalState>} val - Objeto con las propiedades a actualizar.
 */
export function setS(val: Partial<GlobalState>): void { Object.assign(S, val); }

/** 
 * Indica si el estado ha sido hidratado desde la nube SQL/Supabase.
 * @type {boolean} 
 */
export let cloudStateHydrated = false;
export function setCloudStateHydrated(val: boolean): void { cloudStateHydrated = val; }

/** 
 * Almacena la función de desuscripción de la escucha cloud, si una integración la registra.
 * @type {Function|null} 
 */
export let cloudStateUnsubscribe: StoreUnsubscribe = null;
export function setCloudStateUnsubscribe(val: StoreUnsubscribe): void { cloudStateUnsubscribe = val; }

/** 
 * Flag para evitar bucles durante la aplicación de cambios remotos.
 * @type {boolean} 
 */
export let isApplyingRemoteCloudState = false;
export function setIsApplyingRemoteCloudState(val: boolean): void { isApplyingRemoteCloudState = val; }

/** 
 * Silencia temporalmente el guardado automático en la nube.
 * @type {boolean} 
 */
export let suppressCloudStateSave = false;
export function setSuppressCloudStateSave(val: boolean): void { suppressCloudStateSave = val; }

/** 
 * Filtro activo en el panel de instrumentos (Rúbricas/Cotejo).
 * @type {string} 
 */
export let INSTRUMENT_FILTER = 'all';
export function setInstrumentFilter(val: string): void { INSTRUMENT_FILTER = val; }

/** 
 * Filtros de búsqueda para la biblioteca de instrumentos.
 * @type {{ gradeId: string, type: string, subject: string, periodId: string }} 
 */
export let INSTRUMENT_LIBRARY_FILTERS: InstrumentLibraryFilters = { gradeId: '', type: '', subject: '', periodId: '' };
export function setInstrumentLibraryFilters(val: Partial<InstrumentLibraryFilters>): void {
  INSTRUMENT_LIBRARY_FILTERS = { ...INSTRUMENT_LIBRARY_FILTERS, ...val };
}

/** 
 * Estado del menú de descarga de instrumentos.
 * @type {{ openId: string|null, root: HTMLElement|null }}
 */
export const INSTRUMENT_DOWNLOAD_MENU: { openId: string | null; root: HTMLElement | null } = { openId: null, root: null };

/** 
 * ID del temporizador para el debounce del guardado persistente (localStorage/Cloud).
 * @type {number|null} 
 */
export let persistDebounceTimer: number | null = null;
export function setPersistDebounceTimer(val: number | null): void { persistDebounceTimer = val; }

/** 
 * Indica si hay una operación de persistencia pendiente de ejecución.
 * @type {boolean} 
 */
export let persistPending = false;
export function setPersistPending(val: boolean): void { persistPending = val; }

/** 
 * Mantiene la selección del mes en el panel de asistencia aunque cambie el contexto.
 * @type {boolean} 
 */
export let attendanceMonthPinned = false;
export function setAttendanceMonthPinned(val: boolean): void { attendanceMonthPinned = val; }

/** 
 * Token incremental para disparar re-renderizados de componentes en paneles legados.
 * @type {number} 
 */
export let panelEnhancementToken = 0;
export function incrementPanelEnhancementToken(): void { panelEnhancementToken++; }

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
