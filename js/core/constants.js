/**
 * Constantes Globales de la Aplicación (EduGest Constants).
 * --------------------------------------------------------------------------
 * Este módulo centraliza todos los valores fijos, claves de configuración y
 * parámetros de comportamiento del sistema.
 */

/** Clave raíz para el almacenamiento local persistente (IndexedDB/LocalStorage). */
export const STORAGE_KEY = 'eg_v3';

/** Tiempo máximo de espera (ms) para la inicialización de Firebase Auth. */
export const AUTH_BOOT_TIMEOUT_MS = 5000;

/** Símbolo interno para identificar el error de tiempo de espera en el arranque. */
export const AUTH_BOOT_TIMEOUT = Symbol('AUTH_BOOT_TIMEOUT');

/** Clave para el almacenamiento de datos de sesión volátiles. */
export const SESSION_STORAGE_KEY = 'eg_v3:session';

/** Identificadores de los bloques pedagógicos del currículo. */
export const BLOCKS = ['B1', 'B2', 'B3', 'B4'];

/** Configuración predeterminada de periodos escolares. */
export const DEFAULT_PERIODS = [
  { id: 'P1', name: 'Periodo 1', order: 1 },
  { id: 'P2', name: 'Periodo 2', order: 2 },
  { id: 'P3', name: 'Periodo 3', order: 3 },
  { id: 'P4', name: 'Periodo 4', order: 4 },
];

/** Estructura base del calendario académico dominicano. */
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

/** Clave para persistir el estado del panel actual del usuario. */
export const SESSION_PANEL_STATE_KEY = 'eg_v3:panel';

/** Clave para la lista de perfiles de usuario recordados en el dispositivo. */
export const AUTH_USERS_STORAGE_KEY = 'eg_v3:auth_users';

/** Prefijo para las claves de almacenamiento de espacios de trabajo individuales. */
export const USER_WORKSPACE_STORAGE_PREFIX = 'eg_v3:workspace:';

/** Dirección base del servicio de backend para funciones de Inteligencia Artificial. */
export const DEFAULT_AI_BACKEND_URL = 'https://edugest-ndgk.onrender.com';

/** Etiqueta de versión/lanzamiento actual de la aplicación. */
export const APP_RELEASE_TAG = '2026.03';

/** Versión del esquema de datos para copias de seguridad. */
export const BACKUP_SCHEMA_VERSION = 2;

/** Versión del motor de políticas de licenciamiento. */
export const LICENSE_MODEL_VERSION = '2026-03-24';

/** Número máximo de dispositivos de confianza permitidos por cuenta. */
export const ACCOUNT_MAX_TRUSTED_DEVICES = 3;

/** Número máximo de sesiones activas simultáneas permitidas. */
export const ACCOUNT_MAX_ACTIVE_SESSIONS = 5;

/** Tiempo de retraso (ms) para la búsqueda en el tablero principal. */
export const DASHBOARD_SEARCH_DEBOUNCE_MS = 140;

/** Tiempo de retraso (ms) para la persistencia automática de cambios. */
export const PERSIST_DEBOUNCE_MS = 140;

/** Contexto de verificación de credenciales (inicialmente vacío). */
export const AUTH_VERIFY_CTX = { email: '', password: '' };

/** Configuración de límites de intentos para el registro de usuarios. */
export const REGISTER_RATE_LIMIT = {
  key: 'eg_v3:register-rate-limit',
  windowMs: 10 * 60 * 1000,
  maxAttempts: 5,
  blockMs: 15 * 60 * 1000,
};

/** Versión vigente de los términos y condiciones. */
export const TERMS_VERSION = '2026-03-24';

/** Listado de instituciones educativas predeterminadas para nuevos perfiles. */
export const DEFAULT_SCHOOLS = [
  'Colegio Católico Cardenal Beras',
  'Jorge Rubén Bonilla Castelle',
  'Eugenio María de Hostos',
  'Cristino Pitta',
  'La Hoja',
];

/** Modo de visualización predeterminado de las actividades pedagógicas. */
export const ACT_VIEW_MODE_DEFAULT = 'blocks';

/** Capacidad máxima de estudiantes por aula recomendada para asistencia v2. */
export const ATTENDANCE_V2_SLOT_CAPACITY = 40;

/** Objetos de control para interacciones de la barra lateral (Sidebar). */
export const SIDEBAR_INTERACTION = { closeTimer: null, suppressAutoCloseUntil: 0 };
export const SIDEBAR_PERF = { rafId: null };
export const PANEL_MOTION = { observer: null, token: 0 };

/** Estado persistente para mejoras de interacción y búsqueda rápida. */
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

/** Tiempos de animación y retraso para la barra lateral. */
export const SIDEBAR_TIMINGS = {
  expandMs: 220,
  collapseMs: 200,
  pointerLeaveCloseDelayMs: 130,
  focusOutCloseDelayMs: 120,
  reopenGraceMs: 150,
};

/** Niveles educativos reconocidos por el sistema. */
export const EDUCATION_SECTIONS = ['Inicial', 'Primaria', 'Secundaria'];

/** Clases CSS de tema visual asociadas a cada nivel educativo. */
export const EDUCATION_THEME_CLASS_BY_SECTION = {
  Inicial: 'edu-level-inicial',
  Primaria: 'edu-level-primaria',
  Secundaria: 'edu-level-secundaria',
};

/** Clases CSS para combinaciones de niveles educativos. */
export const EDUCATION_THEME_CLASS_BY_COMBINATION = {
  'Inicial+Primaria': 'edu-level-combo-inicial-primaria',
  'Primaria+Secundaria': 'edu-level-combo-primaria-secundaria',
};

/** Catálogo de grados escolares por nivel educativo. */
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

/** Claves simplificadas para el currículo de secundaria. */
export const SECONDARY_CURRICULUM_GRADE_KEYS = ['1ro', '2do', '3ro', '4to', '5to', '6to'];

/** Opciones de configuración para instrumentos de evaluación en la planificación. */
export const LESSON_PLAN_INSTRUMENT_TYPE_OPTIONS = [
  { value: 'rubrica_analitica', label: 'Rúbrica' },
  { value: 'lista_cotejo_a', label: 'Lista de cotejo' },
  { value: 'lista_cotejo_b', label: 'Lista ponderada' },
  { value: 'escala_estimativa', label: 'Escala estimativa' },
];

/**
 * Mapeo de elementos estáticos del DOM (Legacy Bridges).
 * Facilita el acceso a contenedores principales desde el código modular.
 */
export const STATIC_DOM = {
  get navLinks() { return Array.from(document.querySelectorAll('.sb-link')); },
  get overlays() { return Array.from(document.querySelectorAll('.ov')); },
  get topTitle() { return document.getElementById('tbt'); },
  get topSubtitle() { return document.getElementById('tbs'); },
  get topContext() { return document.getElementById('tb-context'); },
  get topActions() { return document.getElementById('tb-actions'); },
  get view() { return document.getElementById('view'); },
};

/** Valor temporal para grados durante la creación de planificaciones. */
export const LESSON_PLAN_TEMP_GRADE_VALUE = '__temp_grade__';

/** Recursos didácticos predeterminados del catálogo. */
export const LESSON_PLAN_RESOURCE_PRESETS = [
  'Pizarra', 'Cuaderno', 'Lápiz', 'Marcadores', 'Borrador', 'Libro de texto',
  'Guía impresa', 'Imágenes', 'Diapositivas', 'Video', 'Simulador',
  'Computadora', 'Televisor', 'Internet',
];

/** Ejes transversales del diseño curricular dominicano. */
export const LESSON_PLAN_TRANSVERSAL_AXES = [
  { value: 'Educación ambiental y desarrollo sostenible', description: 'Promueve el cuidado del medio ambiente y el uso responsable de los recursos.' },
  { value: 'Educación en valores y ciudadanía', description: 'Fomenta el respeto, la responsabilidad y la convivencia.' },
  { value: 'Educación para la democracia y la convivencia', description: 'Promueve el diálogo, la participación y la resolución pacífica de conflictos.' },
  { value: 'Educación para la salud y el bienestar', description: 'Favorece hábitos de vida saludable y cuidado integral de la persona.' },
  { value: 'Educación para el trabajo y la productividad', description: 'Desarrolla responsabilidad, compromiso y valoración del trabajo.' },
  { value: 'Educación en igualdad y equidad de género', description: 'Promueve el respeto, la inclusión y la equidad entre las personas.' },
];

/** Competencias Fundamentales del currículo dominicano. */
export const LESSON_PLAN_FUNDAMENTAL_COMPETENCY_OPTIONS = [
  'Competencia comunicativa',
  'Competencia de pensamiento lógico, creativo y crítico',
  'Competencia de resolución de problemas',
  'Competencia ética y ciudadana',
  'Competencia científica y tecnológica',
  'Competencia ambiental y de la salud',
  'Competencia de desarrollo personal y espiritual',
];

/** Etiquetas para los bloques de calificación/evaluación. */
export const LESSON_PLAN_BLOCK_LABELS = {
  B1: 'Bloque 1',
  B2: 'Bloque 2',
  B3: 'Bloque 3',
  B4: 'Bloque 4',
};
