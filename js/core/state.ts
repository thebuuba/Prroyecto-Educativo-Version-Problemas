/**
 * Gestión del Estado Global Reactivo de EduGest.
 * Este módulo centraliza el estado de la aplicación y contenedores globales.
 */

import { createInitialState } from './config.ts';

// Inicialización de contenedores globales para compatibilidad y registro de paneles.
window.RENDERS = window.RENDERS || {};

export type UnknownRecord = Record<string, unknown>;
export type Nullable<T> = T | null;
export type StoreUnsubscribe = (() => void) | null;
export type StorePathPattern = string | RegExp;

export interface InstrumentLibraryFilters {
  gradeId: string;
  type: string;
  subject: string;
  periodId: string;
}

export interface RuntimeState {
  cloudStateHydrated: boolean;
  cloudStateUnsubscribe: StoreUnsubscribe;
  isApplyingRemoteCloudState: boolean;
  suppressCloudStateSave: boolean;
  instrumentFilter: string;
  instrumentLibraryFilters: InstrumentLibraryFilters;
  instrumentDownloadMenu: { openId: string | null; root: HTMLElement | null };
  persistDebounceTimer: number | null;
  persistPending: boolean;
  attendanceMonthPinned: boolean;
  panelEnhancementToken: number;
  studentRosterCache: { token: string; rosterStudents: Map<string, unknown> };
  setupFlow: {
    educationSection: string;
    educationSections: unknown[];
    educationSectionConfirmed: boolean;
    educationSectionLocked: boolean;
    educationSectionStep: string;
  };
  educationSectionModalContext: { fromAuth: boolean };
  termsAcceptanceFlow: { openSetupAfterAccept: boolean; revokeOnDecline: boolean };
  deviceVerificationFlow: {
    pendingUser: unknown;
    pendingAfterLogin: boolean;
    pendingMaskedEmail: string;
    pendingSource: string;
  };
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
  runtime: RuntimeState;
  [key: string]: unknown;
}

export interface StoreChange<TState extends object = GlobalState> {
  path: string;
  pathParts: string[];
  value: unknown;
  previousValue: unknown;
  state: Store<TState>;
}

export interface Store<TState extends object = GlobalState> extends TState {
  subscribe(pathPattern: StorePathPattern, callback: (change: StoreChange<TState>) => void): () => void;
}

type Subscriber<TState extends object> = {
  pattern: StorePathPattern;
  matcher: (path: string) => boolean;
  callback: (change: StoreChange<TState>) => void;
};

function createRuntimeState(): RuntimeState {
  return {
    cloudStateHydrated: false,
    cloudStateUnsubscribe: null,
    isApplyingRemoteCloudState: false,
    suppressCloudStateSave: false,
    instrumentFilter: 'all',
    instrumentLibraryFilters: { gradeId: '', type: '', subject: '', periodId: '' },
    instrumentDownloadMenu: { openId: null, root: null },
    persistDebounceTimer: null,
    persistPending: false,
    attendanceMonthPinned: false,
    panelEnhancementToken: 0,
    studentRosterCache: {
      token: '',
      rosterStudents: new Map(),
    },
    setupFlow: {
      educationSection: '',
      educationSections: [],
      educationSectionConfirmed: false,
      educationSectionLocked: false,
      educationSectionStep: 'select',
    },
    educationSectionModalContext: {
      fromAuth: false,
    },
    termsAcceptanceFlow: {
      openSetupAfterAccept: false,
      revokeOnDecline: false,
    },
    deviceVerificationFlow: {
      pendingUser: null,
      pendingAfterLogin: false,
      pendingMaskedEmail: '',
      pendingSource: 'login',
    },
  };
}

function isObservableObject(value: unknown): value is Record<string | symbol, unknown> {
  if (!value || typeof value !== 'object') return false;
  if (value instanceof Date || value instanceof Map || value instanceof Set) return false;
  if (value instanceof WeakMap || value instanceof WeakSet) return false;
  if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) return false;
  return true;
}

function pathToString(pathParts: string[]): string {
  return pathParts.join('.');
}

function createMatcher(pattern: StorePathPattern): (path: string) => boolean {
  if (pattern instanceof RegExp) return (path) => pattern.test(path);

  const clean = String(pattern || '**').trim();
  if (!clean || clean === '**' || clean === '*') return () => true;

  const escaped = clean
    .split('.')
    .map((segment) => {
      if (segment === '**') return '.*';
      if (segment === '*') return '[^.]+';
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('\\.');

  const matcher = new RegExp(`^${escaped}$`);
  return (path) => matcher.test(path);
}

function emitStoreChange<TState extends object>(
  subscribers: Subscriber<TState>[],
  store: Store<TState>,
  pathParts: string[],
  value: unknown,
  previousValue: unknown,
): void {
  const path = pathToString(pathParts);
  const detail: StoreChange<TState> = {
    path,
    pathParts,
    value,
    previousValue,
    state: store,
  };

  window.dispatchEvent(new CustomEvent('store:changed', { detail }));

  subscribers.forEach((subscriber) => {
    if (!subscriber.matcher(path)) return;
    subscriber.callback(detail);
  });
}

export function createStore<TState extends object>(initialState: TState): Store<TState> {
  const subscribers: Subscriber<TState>[] = [];
  const proxyCache = new WeakMap<object, unknown>();
  let storeRef: Store<TState>;

  const wrap = (target: unknown, pathParts: string[]): unknown => {
    if (!isObservableObject(target)) return target;
    const cached = proxyCache.get(target);
    if (cached) return cached;

    const proxy = new Proxy(target, {
      get(currentTarget, prop, receiver) {
        const value = Reflect.get(currentTarget, prop, receiver);
        if (typeof prop === 'symbol') return value;
        return wrap(value, [...pathParts, String(prop)]);
      },
      set(currentTarget, prop, value, receiver) {
        const previousValue = Reflect.get(currentTarget, prop, receiver);
        const nextValue = isObservableObject(value)
          ? wrap(value, [...pathParts, String(prop)])
          : value;
        const changed = previousValue !== nextValue;
        const didSet = Reflect.set(currentTarget, prop, nextValue, receiver);
        if (didSet && changed && typeof prop !== 'symbol') {
          emitStoreChange(subscribers, storeRef, [...pathParts, String(prop)], nextValue, previousValue);
        }
        return didSet;
      },
      deleteProperty(currentTarget, prop) {
        const previousValue = Reflect.get(currentTarget, prop);
        const deleted = Reflect.deleteProperty(currentTarget, prop);
        if (deleted && typeof prop !== 'symbol') {
          emitStoreChange(subscribers, storeRef, [...pathParts, String(prop)], undefined, previousValue);
        }
        return deleted;
      },
    });

    proxyCache.set(target, proxy);
    return proxy;
  };

  storeRef = wrap(initialState, []) as Store<TState>;
  Object.defineProperty(storeRef, 'subscribe', {
    value(pathPattern: StorePathPattern, callback: (change: StoreChange<TState>) => void): () => void {
      const subscriber = {
        pattern: pathPattern,
        matcher: createMatcher(pathPattern),
        callback,
      };
      subscribers.push(subscriber);
      return () => {
        const index = subscribers.indexOf(subscriber);
        if (index >= 0) subscribers.splice(index, 1);
      };
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });

  return storeRef;
}

const initialState = createInitialState() as GlobalState;
Object.defineProperty(initialState, 'runtime', {
  value: createRuntimeState(),
  enumerable: false,
  configurable: true,
  writable: false,
});

/**
 * Estado Global Reactivo (S).
 * Se expone a window.S para mantener compatibilidad con el código administrativo.
 */
export const S = createStore(initialState);

// Exposición global para compatibilidad.
window.S = S;

/**
 * Actualiza parcialmente el estado global fusionando el nuevo valor.
 */
export function setS(val: Partial<GlobalState>): void {
  Object.assign(S, val);
}

export const runtimeState = S.runtime;

// Fachada legacy: los datos viven en S.runtime; estos nombres preservan imports antiguos.
export let cloudStateHydrated = runtimeState.cloudStateHydrated;
export function setCloudStateHydrated(val: boolean): void {
  runtimeState.cloudStateHydrated = val;
  cloudStateHydrated = val;
}

export let cloudStateUnsubscribe: StoreUnsubscribe = runtimeState.cloudStateUnsubscribe;
export function setCloudStateUnsubscribe(val: StoreUnsubscribe): void {
  runtimeState.cloudStateUnsubscribe = val;
  cloudStateUnsubscribe = val;
}

export let isApplyingRemoteCloudState = runtimeState.isApplyingRemoteCloudState;
export function setIsApplyingRemoteCloudState(val: boolean): void {
  runtimeState.isApplyingRemoteCloudState = val;
  isApplyingRemoteCloudState = val;
}

export let suppressCloudStateSave = runtimeState.suppressCloudStateSave;
export function setSuppressCloudStateSave(val: boolean): void {
  runtimeState.suppressCloudStateSave = val;
  suppressCloudStateSave = val;
}

export let INSTRUMENT_FILTER = runtimeState.instrumentFilter;
export function setInstrumentFilter(val: string): void {
  runtimeState.instrumentFilter = val;
  INSTRUMENT_FILTER = val;
}

export const INSTRUMENT_LIBRARY_FILTERS = runtimeState.instrumentLibraryFilters;
export function setInstrumentLibraryFilters(val: Partial<InstrumentLibraryFilters>): void {
  Object.assign(runtimeState.instrumentLibraryFilters, val);
}

export const INSTRUMENT_DOWNLOAD_MENU = runtimeState.instrumentDownloadMenu;

export let persistDebounceTimer = runtimeState.persistDebounceTimer;
export function setPersistDebounceTimer(val: number | null): void {
  runtimeState.persistDebounceTimer = val;
  persistDebounceTimer = val;
}

export let persistPending = runtimeState.persistPending;
export function setPersistPending(val: boolean): void {
  runtimeState.persistPending = val;
  persistPending = val;
}

export let attendanceMonthPinned = runtimeState.attendanceMonthPinned;
export function setAttendanceMonthPinned(val: boolean): void {
  runtimeState.attendanceMonthPinned = val;
  attendanceMonthPinned = val;
}

export let panelEnhancementToken = runtimeState.panelEnhancementToken;
export function incrementPanelEnhancementToken(): void {
  runtimeState.panelEnhancementToken += 1;
  panelEnhancementToken = runtimeState.panelEnhancementToken;
}

export const STUDENT_ROSTER_CACHE = runtimeState.studentRosterCache;
export const SETUP_FLOW = runtimeState.setupFlow;
export const EDUCATION_SECTION_MODAL_CONTEXT = runtimeState.educationSectionModalContext;
export const TERMS_ACCEPTANCE_FLOW = runtimeState.termsAcceptanceFlow;
export const DEVICE_VERIFICATION_FLOW = runtimeState.deviceVerificationFlow;
