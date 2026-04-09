/**
 * Configuración y Estado Inicial de EduGest (Modular).
 * --------------------------------------------------------------------------
 * Este módulo define las estructuras de datos base, configuraciones de bloques
 * pedagógicos y la factoría para crear el estado inicial del sistema (Redux-like store).
 */

import { STORAGE_KEY, BLOCKS, DEFAULT_PERIODS, DEFAULT_SCHOOLS } from './constants.js';

/**
 * Genera un identificador único alfanumérico corto.
 * @returns {string} ID único.
 */
export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/** Nombres descriptivos de los bloques evaluativos */
export const BNAME = {
  B1: 'Comunicativa',
  B2: 'Pensamiento lógico, creativo y crítico / Resolución de problemas',
  B3: 'Ética y ciudadana / Desarrollo personal y espiritual',
  B4: 'Científica y tecnológica / Ambiental y de la salud',
};

/** Iconos representativos para cada bloque en la UI */
export const BICON = { B1: '🗣', B2: '🔢', B3: '🤝', B4: '🔬' };

/** Colores temáticos (variables CSS) asociados a cada bloque */
export const BCOLOR = { B1: 'var(--com)', B2: 'var(--res)', B3: 'var(--eth)', B4: 'var(--cyt)' };

/** Listado de tipos de instrumentos de evaluación soportados */
export const BASIC_INSTRUMENT_TYPES = ['rubrica_analitica', 'lista_cotejo_a', 'lista_cotejo_b', 'escala_estimativa'];

/** Metadatos descriptivos (título, descripción e icono) para los instrumentos base */
export const BASIC_INSTRUMENT_META = {
  rubrica_analitica: { title: 'Rúbrica', desc: 'Criterios por niveles (4/3/2/1).', icon: '📐' },
  lista_cotejo_a: { title: 'Lista de cotejo', desc: 'Cumple / No cumple por criterio.', icon: '✅' },
  lista_cotejo_b: { title: 'Lista ponderada', desc: 'Checklist con peso por criterio.', icon: '🧮' },
  escala_estimativa: { title: 'Escala estimativa', desc: 'Nunca, A veces, Casi siempre, Siempre.', icon: '📊' },
};

/** Calendario académico predeterminado con periodos y meses activos */
export const DEFAULT_ACADEMIC_CALENDAR = {
  country: 'DO',
  activeMonths: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5],
  periods: [
    { id: 'P1', name: 'Periodo 1', order: 1, months: [8, 9, 10] },
    { id: 'P2', name: 'Periodo 2', order: 2, months: [11, 12, 1] },
    { id: 'P3', name: 'Periodo 3', order: 3, months: [2, 3] },
    { id: 'P4', name: 'Periodo 4', order: 4, months: [4, 5] },
  ],
};

/** Paleta de colores para avatares y elementos visuales dinámicos */
export const AVPAL = ['#00c2b8', '#7c3aed', '#10b981', '#f59e0b', '#3b82f6', '#f43f5e', '#8b5cf6', '#06b6d4'];

/**
 * Crea una configuración de bloque con actividades de ejemplo.
 * @returns {Object} Configuración de bloque con 3 actividades predeterminadas.
 */
export function defaultBlockCfg() {
  return {
    activities: [
      { id: makeId(), name: 'Actividad 1', pts: 20, tipo: '', fecha: '', desc: '', producto: '', instrumentId: null, instrumentIds: [], instrumentHistory: [] },
      { id: makeId(), name: 'Actividad 2', pts: 20, tipo: '', fecha: '', desc: '', producto: '', instrumentId: null, instrumentIds: [], instrumentHistory: [] },
      { id: makeId(), name: 'Actividad 3', pts: 20, tipo: '', fecha: '', desc: '', producto: '', instrumentId: null, instrumentIds: [], instrumentHistory: [] },
    ],
    meta: 100,
    normalize: true,
  };
}

/**
 * Crea una configuración de bloque vacía.
 * @returns {Object}
 */
export function emptyBlockCfg() {
  return { activities: [], meta: 100, normalize: true };
}

/**
 * Crea una configuración de grupo (con los 4 bloques) vacía.
 * @returns {Object}
 */
export function emptyGroupCfg() {
  return {
    B1: emptyBlockCfg(),
    B2: emptyBlockCfg(),
    B3: emptyBlockCfg(),
    B4: emptyBlockCfg(),
  };
}

/**
 * Genera el estado inicial ("Store") completo para una nueva sesión o primer arranque.
 * Define todos los nodos del árbol de estado global (S).
 * @returns {Object} Estado global inicial inicializado.
 */
export function createInitialState() {
  return {
    profile: null,
    grades: [],
    secciones: [],
    estudiantes: [],
    studentDirectory: [],
    actividades: [],
    notas: {},
    blockCfg: {
      B1: defaultBlockCfg(),
      B2: defaultBlockCfg(),
      B3: defaultBlockCfg(),
      B4: defaultBlockCfg(),
    },
    groupConfigs: {},
    templates: [],
    instruments: [],
    evaluations: [],
    usuarios: [],
    authUsers: [],
    sessionUserId: null,
    sessionUserName: null,
    sessionStartedAt: null,
    sessionExpiresAt: null,
    cloudOwnerUid: null,
    schools: [...DEFAULT_SCHOOLS],
    schoolYear: { id: '2025-2026', name: '2025-2026' },
    academicCalendar: JSON.parse(JSON.stringify(DEFAULT_ACADEMIC_CALENDAR)),
    periods: JSON.parse(JSON.stringify(DEFAULT_PERIODS)),
    activePeriodId: 'P1',
    periodGroupConfigs: {},
    notasByPeriod: {},
    attendance: {
      monthKey: '',
      records: {},
    },
    teacherPlanner: {
      monthKey: '',
      customEvents: [],
      weeklySchedule: [],
    },
    activeGroupId: null,
    activeCourseId: null,
    currentPage: 'dashboard',
    activityViewMode: 'blocks',
    aiChatHistory: [],
    editingStudentId: null,
  };
}
