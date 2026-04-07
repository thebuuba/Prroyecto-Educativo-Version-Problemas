import { createInitialState } from './config.js';

/**
 * Estado Global Reactivo (S).
 * Contiene toda la información de la sesión, configuración, grados, estudiantes, etc.
 * Se expone a window.S para mantener compatibilidad con el código administrativo (App Shell).
 */
export const S = createInitialState();
export function setS(val) { Object.assign(S, val); }
window.S = S;


/** Flags de sincronización con la nube (Firestore). */
export let cloudStateHydrated = false;
export function setCloudStateHydrated(val) { cloudStateHydrated = val; }

export let cloudStateUnsubscribe = null;
export function setCloudStateUnsubscribe(val) { cloudStateUnsubscribe = val; }

export let isApplyingRemoteCloudState = false;
export function setIsApplyingRemoteCloudState(val) { isApplyingRemoteCloudState = val; }

export let suppressCloudStateSave = false;
export function setSuppressCloudStateSave(val) { suppressCloudStateSave = val; }

export let INSTRUMENT_FILTER = 'all';
export function setInstrumentFilter(val) { INSTRUMENT_FILTER = val; }

export let INSTRUMENT_LIBRARY_FILTERS = { gradeId: '', type: '', subject: '', periodId: '' };
export function setInstrumentLibraryFilters(val) { INSTRUMENT_LIBRARY_FILTERS = val; }

export const INSTRUMENT_DOWNLOAD_MENU = { openId: null, root: null };

export let persistDebounceTimer = null;
export function setPersistDebounceTimer(val) { persistDebounceTimer = val; }

export let persistPending = false;
export function setPersistPending(val) { persistPending = val; }

export let attendanceMonthPinned = false;
export function setAttendanceMonthPinned(val) { attendanceMonthPinned = val; }

export let panelEnhancementToken = 0;
export function incrementPanelEnhancementToken() { panelEnhancementToken++; }

export const STUDENT_ROSTER_CACHE = {
  token: '',
  rosterStudents: new Map(),
};

export const SETUP_FLOW = {
  educationSection: '',
  educationSections: [],
  educationSectionConfirmed: false,
  educationSectionLocked: false,
  educationSectionStep: 'select',
};

export const EDUCATION_SECTION_MODAL_CONTEXT = {
  fromAuth: false,
};

export const TERMS_ACCEPTANCE_FLOW = {
  openSetupAfterAccept: false,
  revokeOnDecline: false,
};

export const DEVICE_VERIFICATION_FLOW = {
  pendingUser: null,
  pendingAfterLogin: false,
  pendingMaskedEmail: '',
  pendingSource: 'login',
};


