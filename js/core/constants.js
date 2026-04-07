/** Clave raíz para el almacenamiento local (Persistence). */
export const STORAGE_KEY = 'eg_v3';

/** Tiempo máximo de espera para el arranque de autenticación. */
export const AUTH_BOOT_TIMEOUT_MS = 5000;
export const AUTH_BOOT_TIMEOUT = Symbol('AUTH_BOOT_TIMEOUT');

/** Clave para datos de sesión efímeros. */
export const SESSION_STORAGE_KEY = 'eg_v3:session';

/** Bloques académicos. */
export const BLOCKS = ['B1', 'B2', 'B3', 'B4'];

/** Periodos académicos por defecto. */
export const DEFAULT_PERIODS = [
  { id: 'P1', name: 'Periodo 1', order: 1 },
  { id: 'P2', name: 'Periodo 2', order: 2 },
  { id: 'P3', name: 'Periodo 3', order: 3 },
  { id: 'P4', name: 'Periodo 4', order: 4 },
];

/** Calendario académico por defecto. */
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

/** Clave para el estado del panel actual. */
export const SESSION_PANEL_STATE_KEY = 'eg_v3:panel';

/** Clave para la lista de usuarios autenticados en el dispositivo. */
export const AUTH_USERS_STORAGE_KEY = 'eg_v3:auth_users';

/** Prefijo para los espacios de trabajo de cada usuario. */
export const USER_WORKSPACE_STORAGE_PREFIX = 'eg_v3:workspace:';

/** URL base del backend de IA. */
export const DEFAULT_AI_BACKEND_URL = 'https://edugest-ndgk.onrender.com';

/** Versión actual de la aplicación. */
export const APP_RELEASE_TAG = '2026.03';

/** Versión del esquema de backups. */
export const BACKUP_SCHEMA_VERSION = 2;

/** Versión del modelo de licencias. */
export const LICENSE_MODEL_VERSION = '2026-03-24';

/** Límites de seguridad de la cuenta. */
export const ACCOUNT_MAX_TRUSTED_DEVICES = 3;
export const ACCOUNT_MAX_ACTIVE_SESSIONS = 5;

/** Tiempos de debounce para optimización de UI. */
export const DASHBOARD_SEARCH_DEBOUNCE_MS = 140;
export const PERSIST_DEBOUNCE_MS = 140;
export const AUTH_VERIFY_CTX = { email: '', password: '' };
export const REGISTER_RATE_LIMIT = {
  key: 'eg_v3:register-rate-limit',
  windowMs: 10 * 60 * 1000,
  maxAttempts: 5,
  blockMs: 15 * 60 * 1000,
};
export const TERMS_VERSION = '2026-03-24';
/** Centro educativo por defecto. */
export const DEFAULT_SCHOOLS = [
  'Colegio Catolico Cardenal Beras',
  'Jorge Ruben Bonilla Castelle',
  'Euugenio Maria de Hostos',
  'Cristino Pitta',
  'La Hoja',
];

/** Modo de visualización de actividades por defecto. */
export const ACT_VIEW_MODE_DEFAULT = 'blocks';

/** Capacidad máxima sugerida por aula. */
export const ATTENDANCE_V2_SLOT_CAPACITY = 40;


export const SIDEBAR_INTERACTION = { closeTimer: null, suppressAutoCloseUntil: 0 };
export const SIDEBAR_PERF = { rafId: null };
export const PANEL_MOTION = { observer: null, token: 0 };
export const INTERACTION_ENHANCEMENTS = {
  initialized: false,
  rippleBound: false,
  quickPaletteBound: false,
  container: null,
  input: null,
  list: null,
  hint: null,
  entries: [],
  filtered: [],
  activeIndex: -1,
};
export const SIDEBAR_TIMINGS = {
  expandMs: 220,
  collapseMs: 200,
  pointerLeaveCloseDelayMs: 130,
  focusOutCloseDelayMs: 120,
  reopenGraceMs: 150,
};

export const EDUCATION_SECTIONS = ['Inicial', 'Primaria', 'Secundaria'];
export const EDUCATION_THEME_CLASS_BY_SECTION = {
  Inicial: 'edu-level-inicial',
  Primaria: 'edu-level-primaria',
  Secundaria: 'edu-level-secundaria',
};
export const EDUCATION_THEME_CLASS_BY_COMBINATION = {
  'Inicial+Primaria': 'edu-level-combo-inicial-primaria',
  'Primaria+Secundaria': 'edu-level-combo-primaria-secundaria',
};
export const GRADE_CATALOG_BY_SECTION = {
  Inicial: ['Pre-kinder', 'Kinder', 'Pre-primario'],
  Primaria: ['1ro', '2do', '3ro', '4to', '5to', '6to'],
  Secundaria: [
    '1ro de Secundaria',
    '2do de Secundaria',
    '3ro de Secundaria',
    '4to de Secundaria',
    '5to de Secundaria',
    '6to de Secundaria',
  ],
};

export const SECONDARY_CURRICULUM_GRADE_KEYS = ['1ro', '2do', '3ro', '4to', '5to', '6to'];

export const LESSON_PLAN_INSTRUMENT_TYPE_OPTIONS = [
  { value: 'rubrica_analitica', label: 'Rúbrica' },
  { value: 'lista_cotejo_a', label: 'Lista de cotejo' },
  { value: 'lista_cotejo_b', label: 'Lista ponderada' },
  { value: 'escala_estimativa', label: 'Escala estimativa' },
];

/** Mapeo de elementos estáticos del DOM (Legacy Bridges). */
export const STATIC_DOM = {
  get navLinks() { return Array.from(document.querySelectorAll('.sb-link')); },
  get overlays() { return Array.from(document.querySelectorAll('.ov')); },
  get topTitle() { return document.getElementById('tbt'); },
  get topSubtitle() { return document.getElementById('tbs'); },
  get topContext() { return document.getElementById('tb-context'); },
  get topActions() { return document.getElementById('tb-actions'); },
  get view() { return document.getElementById('view'); },
};

export const LESSON_PLAN_TEMP_GRADE_VALUE = '__temp_grade__';

export const LESSON_PLAN_RESOURCE_PRESETS = [
  'Pizarra',
  'Cuaderno',
  'Lápiz',
  'Marcadores',
  'Borrador',
  'Libro de texto',
  'Guía impresa',
  'Imágenes',
  'Diapositivas',
  'Video',
  'Simulador',
  'Computadora',
  'Televisor',
  'Internet',
];

export const LESSON_PLAN_TRANSVERSAL_AXES = [
  {
    value: 'Educación ambiental y desarrollo sostenible',
    description: 'Promueve el cuidado del medio ambiente y el uso responsable de los recursos.',
  },
  {
    value: 'Educación en valores y ciudadanía',
    description: 'Fomenta el respeto, la responsabilidad y la convivencia.',
  },
  {
    value: 'Educación para la democracia y la convivencia',
    description: 'Promueve el diálogo, la participación y la resolución pacífica de conflictos.',
  },
  {
    value: 'Educación para la salud y el bienestar',
    description: 'Favorece hábitos de vida saludable y cuidado integral de la persona.',
  },
  {
    value: 'Educación para el trabajo y la productividad',
    description: 'Desarrolla responsabilidad, compromiso y valoración del trabajo.',
  },
  {
    value: 'Educación en igualdad y equidad de género',
    description: 'Promueve el respeto, la inclusión y la equidad entre las personas.',
  },
];

export const LESSON_PLAN_FUNDAMENTAL_COMPETENCY_OPTIONS = [
  'Competencia comunicativa',
  'Competencia de pensamiento lógico, creativo y crítico',
  'Competencia de resolución de problemas',
  'Competencia ética y ciudadana',
  'Competencia científica y tecnológica',
  'Competencia ambiental y de la salud',
  'Competencia de desarrollo personal y espiritual',
];

export const LESSON_PLAN_BLOCK_LABELS = {
  B1: 'Bloque 1',
  B2: 'Bloque 2',
  B3: 'Bloque 3',
  B4: 'Bloque 4',
};
