/**
 * Utilidades Generales de EduGest.
 * --------------------------------------------------------------------------
 * Este módulo centraliza funciones auxiliares para el manejo de UI, fechas,
 * errores, reparación de texto corrupto (Mojibake) y depuración del sistema.
 */

/**
 * Constantes de niveles educativos y temas visuales.
 */
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

/**
 * Planificador de tareas no críticas para ejecución durante el tiempo de inactividad del navegador.
 * Utiliza requestIdleCallback si está disponible, de lo contrario cae a setTimeout.
 */
export const scheduleNonCriticalTask = (() => {
  if (typeof window.requestIdleCallback === 'function') {
    return (task, timeout = 180) => window.requestIdleCallback(() => task(), { timeout });
  }
  return (task) => window.setTimeout(task, 32);
})();

// Soporte para librerías externas de exportación
let xlsxLibraryPromise = null;

/**
 * Asegura la carga dinámica de la librería SheetJS (XLSX).
 * @returns {Promise<Object>} Instancia de XLSX.
 */
export function ensureXlsxLibrary() {
  if (typeof window.XLSX !== 'undefined') return Promise.resolve(window.XLSX);
  if (xlsxLibraryPromise) return xlsxLibraryPromise;
  xlsxLibraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.XLSX !== 'undefined') resolve(window.XLSX);
      else reject(new Error('XLSX no disponible tras cargar el script.'));
    };
    script.onerror = () => reject(new Error('No se pudo cargar el generador XLSX.'));
    document.head.appendChild(script);
  }).catch((error) => {
    xlsxLibraryPromise = null;
    throw error;
  });
  return xlsxLibraryPromise;
}

/**
 * Resuelve el mensaje de error más amigable para el usuario.
 * @param {Error|Object} error - Objeto de error capturado.
 * @param {string} [fallback] - Mensaje por defecto.
 * @returns {string} Mensaje final en español.
 */
export function errorMessage(error, fallback = 'No se pudo completar la acción.') {
  if (window.EduGestCloud?.friendlyError) {
    const cloudMessage = String(window.EduGestCloud.friendlyError(error) || '').trim();
    if (cloudMessage) return cloudMessage;
  }
  const directMessage = String(error?.message || '').trim();
  if (directMessage) return directMessage;
  return fallback;
}

/**
 * Registra un error en consola y muestra una notificación (toast) al usuario.
 * @param {string} context - Contexto donde ocurrió el error (ej. "Auth").
 * @param {Error} error - Excepción capturada.
 * @param {Object} [options] - Configuración de visualización.
 */
export function reportError(context, error, options = {}) {
  const { fallback = 'No se pudo completar la acción.', tone = 'error' } = options;
  console.error(`[EduGest][${context}]`, error);
  if (window.toast) window.toast(`${errorMessage(error, fallback)}`, tone);
}

/**
 * Escapa caracteres especiales de HTML para prevenir ataques XSS.
 * Incluye reparación previa de texto corrupto.
 * @param {string} value - Texto a escapar.
 * @returns {string}
 */
export function escapeHtml(value) {
  const text = fixMojibakeText(String(value == null ? '' : value));
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Verifica si un elemento del DOM es un campo de entrada editable.
 * @param {HTMLElement} el - Elemento a validar.
 * @returns {boolean}
 */
export function isEditableTarget(el) {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = String(el.tagName || '').toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) a un formato legible corto (es-DO).
 * @param {string} d - Fecha en formato ISO.
 * @returns {string} Ej: "7 Abr".
 */
export function fmtDate(d) {
  if (!d) return '';
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-DO', { day: 'numeric', month: 'short' });
  } catch (e) {
    return d;
  }
}

/**
 * Obtiene la llave del mes actual en formato estandarizado YYYY-MM.
 * @returns {string}
 */
export function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Normaliza una llave de mes al formato YYYY-MM, validando su estructura.
 * @param {string} monthKey - Llave a normalizar.
 * @returns {string}
 */
export function normalizeAttendanceMonthKey(monthKey) {
  const match = String(monthKey || '').match(/^(\d{4})-(\d{2})$/);
  if (!match) return getCurrentMonthKey();
  const month = parseInt(match[2], 10);
  if (month < 1 || month > 12) return getCurrentMonthKey();
  return `${match[1]}-${String(month).padStart(2, '0')}`;
}

/**
 * Genera una llave de mes (YYYY-MM) a partir de un objeto Date.
 * @param {Date|string} date - Objeto de fecha.
 * @returns {string}
 */
export function attendanceMonthKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Obtiene la fecha de inicio de un mes (1ero del mes) a las 12:00 PM para evitar problemas de zona horaria.
 * @param {string} monthKey - Llave YYYY-MM.
 * @returns {Date}
 */
export function attendanceMonthStart(monthKey) {
  const normalized = normalizeAttendanceMonthKey(monthKey);
  const [year, month] = normalized.split('-').map((value) => parseInt(value, 10));
  return new Date(year, month - 1, 1, 12, 0, 0, 0);
}

/**
 * Redondea un número a 2 decimales de forma segura.
 * @param {number|string} n - Número a redondear.
 * @returns {number}
 */
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * Detecta si una cadena contiene marcadores típicos de errores de codificación (Mojibake).
 * @param {string} str - Texto a analizar.
 * @returns {boolean}
 */
export function hasMojibakeMarkers(str) {
  if (typeof str !== 'string') return false;
  return /(?:\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]|\u00E2[\u0080-\u00BF]{1,2}|\u00F0[\u0080-\u00BF]{2,3}|\uFFFD)/.test(str);
}

/**
 * Intenta decodificar una cadena mal interpretada como CP1252 a UTF-8.
 * @param {string} str - Cadena dañada.
 * @returns {string}
 */
export function decodeCp1252Utf8(str) {
  try {
    const bytes = new Uint8Array(Array.from(str, ch => ch.charCodeAt(0) & 255));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (_) {
    return str;
  }
}

/**
 * Calcula la puntuación de "daño" por mojibake en una cadena.
 * @returns {number} Conteo de patrones de error.
 */
export function scoreMojibake(str) {
  if (typeof str !== 'string') return 0;
  const markers = ['Ã','Â','â','ð','ï?½'];
  return markers.reduce((acc, m) => {
    const parts = str.split(m);
    return acc + (parts.length > 1 ? parts.length - 1 : 0);
  }, 0);
}

/**
 * Repara textos con errores de codificación UTF-8 comunes en el intercambio de datos.
 * Aplica decodificación heurística y reemplazos directos para tildes y ñ.
 * @param {string} str - Texto fuente.
 * @returns {string} Texto reparado.
 */
export function fixMojibakeText(str) {
  if (!hasMojibakeMarkers(str)) return str;
  let best = str;
  if (hasMojibakeMarkers(best)) {
    for (let i = 0; i < 2; i++) {
      const candidate = decodeCp1252Utf8(best);
      if (!candidate || candidate === best) break;
      if (scoreMojibake(candidate) <= scoreMojibake(best)) best = candidate;
    }
  }
  const directReplacements = [
    [/\u00C3\u00A1/g, '\u00E1'], [/\u00C3\u00A9/g, '\u00E9'], [/\u00C3\u00AD/g, '\u00ED'],
    [/\u00C3\u00B3/g, '\u00F3'], [/\u00C3\u00BA/g, '\u00FA'], [/\u00C3\u00B1/g, '\u00F1'],
    [/\u00C3\u0081/g, '\u00C1'], [/\u00C3\u0089/g, '\u00C9'], [/\u00C3\u008D/g, '\u00CD'],
    [/\u00C3\u0093/g, '\u00D3'], [/\u00C3\u009A/g, '\u00DA'], [/\u00C3\u0091/g, '\u00D1'],
    [/\u00C3\u00BC/g, '\u00FC'], [/\u00C3\u009C/g, '\u00DC'], [/\u00C2\u00BF/g, '\u00BF'],
    [/\u00C2\u00A1/g, '\u00A1'], [/\u00C2\u00B0/g, '\u00B0'], [/\u00C2\u00BA/g, '\u00BA'],
    [/\u00C2\u00AA/g, '\u00AA'], [/\u00C2\u00A0/g, ' '],
  ];
  directReplacements.forEach(([pattern, replacement]) => {
    best = best.replace(pattern, replacement);
  });
  return best;
}

/**
 * Retorna la marca de tiempo actual en formato ISO.
 * @returns {string}
 */
export function nowIso() {
  return new Date().toISOString();
}

/**
 * Genera un identificador único corto basado en tiempo y aleatoriedad.
 * @returns {string}
 */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/**
 * Filtra un array eliminando valores nulos/falsos y duplicados.
 * @param {Array} arr - Array fuente.
 * @returns {Array} Array limpio.
 */
export function uniqueValues(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.filter(Boolean))];
}

/**
 * Normaliza una cadena para comparaciones de texto (sin tildes, minúsculas, sin espacios extra).
 * @param {string} str - Texto a normalizar.
 * @returns {string}
 */
export function normTxt(str) {
  if (typeof str !== 'string') return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * Intenta extraer el número ordinal del grado a partir de su nombre (1ro, 2do, etc.).
 * @param {string} gradeName - Nombre del grado.
 * @returns {number} Número del 1 al 6, o 0 si no se identifica.
 */
export function parseGradeLevel(gradeName = '') {
  const g = String(gradeName || '').toLowerCase().trim();
  if (g.includes('primero') || g.includes('1ro')) return 1;
  if (g.includes('segundo') || g.includes('2do')) return 2;
  if (g.includes('tercero') || g.includes('3ro')) return 3;
  if (g.includes('cuarto') || g.includes('4to')) return 4;
  if (g.includes('quinto') || g.includes('5to')) return 5;
  if (g.includes('sexto') || g.includes('6to')) return 6;
  return 0;
}

/**
 * Normaliza la letra de sección (A, B, C, etc.) a partir de un string sucio.
 * @param {string} sec - Texto de la sección.
 * @returns {string} Letra única en mayúscula.
 */
export function parseSection(sec = '') {
  const s = String(sec || '').trim().toUpperCase();
  if (!s) return 'A';
  const m = s.match(/[A-Z]/);
  return m ? m[0] : 'A';
}

/**
 * Ordena una lista de secciones por nivel de grado y luego por letra de sección.
 * @param {Array} sections - Lista de objetos de sección.
 * @returns {Array} Lista ordenada.
 */
export function sortCourses(sections = []) {
  return [...sections].sort((a, b) => {
    const la = a.gradeLevel || 0;
    const lb = b.gradeLevel || 0;
    if (la !== lb) return la - lb;
    const sa = a.sectionLetter || a.sec || '';
    const sb = b.sectionLetter || b.sec || '';
    return sa.localeCompare(sb);
  });
}

/**
 * Recorre recursivamente un objeto de estado y repara todas las cadenas con Mojibake.
 * @param {Object} state - El árbol de estado a reparar.
 * @returns {boolean} True si se realizaron cambios.
 */
export function repairUtf8State(state) {
  if (!state || typeof state !== 'object') return false;
  let changed = false;
  const traverse = (obj) => {
    if (!obj) return;
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        const fixed = fixMojibakeText(obj[key]);
        if (fixed !== obj[key]) {
          obj[key] = fixed;
          changed = true;
        }
      } else if (typeof obj[key] === 'object') {
        traverse(obj[key]);
      }
    });
  };
  traverse(state);
  return changed;
}

/**
 * Verifica si la depuración de sesión está habilitada vía URL o LocalStorage.
 * @returns {boolean}
 */
export function isSessionDebugEnabled() {
  try {
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('debugSession') === '1') return true;
    const flag = String(window.localStorage.getItem('eg_v3:debug-session') || '').trim();
    return flag === '1' || flag.toLowerCase() === 'true';
  } catch (_) {
    return false;
  }
}

/**
 * Verifica si la depuración de autenticación está habilitada.
 * @returns {boolean}
 */
export function isAuthDebugEnabled() {
  try {
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('debugAuth') === '1') return true;
    const flag = String(window.localStorage.getItem('eg_v3:debug-auth') || '').trim();
    return flag === '1' || flag.toLowerCase() === 'true';
  } catch (_) {
    return false;
  }
}

/**
 * Registra un evento de depuración de sesión en la consola si está habilitado.
 */
export function debugSessionFlow(event, payload = {}) {
  if (!isSessionDebugEnabled()) return;
  try {
    console.info(`[EduGest][session-debug] ${event}`, payload);
  } catch (_) {}
}

/**
 * Registra un evento de depuración de autenticación en la consola si está habilitado.
 */
export function debugAuthFlow(event, payload = {}) {
  if (!isAuthDebugEnabled()) return;
  try {
    console.info(`[EduGest][auth-debug] ${event}`, payload);
  } catch (_) {}
}

/**
 * Normaliza una dirección de correo electrónico para usarla como llave de búsqueda.
 * @param {string} email - Correo fuente.
 * @returns {string}
 */
export function authEmailKey(email) {
  return String(email || '').trim().toLowerCase();
}

/**
 * Formatea una duración en milisegundos a un formato de mm:ss para visualización.
 * @param {number} ms - Milisegundos.
 * @returns {string} Ej: "5m 30s".
 */
export function formatMsToMinSec(ms = 0) {
  const safeMs = Math.max(0, Number(ms) || 0);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (!minutes) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

/**
 * Valida y normaliza el modo de acceso de autenticación (Google, Facebook, Email, etc).
 * @param {string} mode - Modo de entrada.
 * @returns {string} Modo válido o cadena vacía.
 */
export function normalizeAuthAccessMode(mode) {
  const value = String(mode || '').trim().toLowerCase();
  const valid = ['google', 'facebook', 'local', 'email'];
  return valid.includes(value) ? value : '';
}

/**
 * Verifica si los servicios de autenticación en la nube están disponibles y configurados.
 * @returns {boolean}
 */
export function canUseCloudAuth() {
  return !!window.EduGestCloud?.isConfigured?.();
}

/**
 * Determina si el sistema debe intentar autenticación local tras un fallo en la nube.
 * @param {Error} error - Error capturado de la nube.
 * @returns {boolean}
 */
export function shouldFallbackToLocalAuth(error) {
  const code = String(error?.code || '').trim();
  const fallbackCodes = new Set([
    'auth/configuration-not-found',
    'auth/operation-not-allowed',
    'auth/network-request-failed',
  ]);
  return fallbackCodes.has(code);
}

/**
 * Obtiene el valor recortado de un elemento input/select por su ID.
 * @param {string} id - ID del elemento DOM.
 * @returns {string} Valor limpio o vacío.
 */
export function v(id) {
  const el = document.getElementById(id);
  return el ? String(el.value || '').trim() : '';
}

/**
 * Extrae solo los dígitos de un teléfono para normalización.
 * @param {string} raw - Valor en crudo.
 * @returns {string}
 */
export function extractPhoneDigits(raw = '') {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1, 11);
  return digits.slice(0, 10);
}

/**
 * Normaliza un número de teléfono al formato (000) 000-0000.
 * @param {string} raw - Valor en crudo.
 * @returns {string}
 */
export function normalizePhoneValue(raw = '') {
  const digits = extractPhoneDigits(raw);
  if (!digits) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Verifica si un teléfono tiene la cantidad correcta de dígitos (10).
 * @param {string} raw - Valor en crudo.
 * @returns {boolean}
 */
export function phoneHasValidDigits(raw = '') {
  return extractPhoneDigits(raw).length === 10;
}

/**
 * Normaliza el nombre de una institución (colegio/escuela).
 * @param {string} name - Nombre de la escuela.
 * @returns {string}
 */
export function normalizeSchoolName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ');
}

/**
 * Construye el nombre completo concatenando nombre(s) y apellido(s).
 * @param {string} firstName - Nombres.
 * @param {string} lastName - Apellidos.
 * @returns {string}
 */
export function buildProfileFullName(firstName = '', lastName = '') {
  return [String(firstName || '').trim(), String(lastName || '').trim()].filter(Boolean).join(' ').trim();
}

/**
 * Normaliza un solo nivel educativo comparándolo con el catálogo oficial.
 * @param {string} section - Nivel educativo.
 * @returns {string} Nivel normalizado o vacío.
 */
export function normalizeEducationLevelName(level) {
  const l = String(level || '').trim().toLowerCase();
  if (l.includes('inicial') || l === 'i') return 'Inicial';
  if (l.includes('primaria') || l === 'p') return 'Primaria';
  if (l.includes('secundaria') || l === 's') return 'Secundaria';
  return '';
}

/**
 * Normaliza una lista (o string separado por comas) de secciones educativas.
 * @param {string|Array} value - Secciones.
 * @returns {Array<string>} Lista de niveles normalizados únicos.
 */
export function normalizeEducationSections(value) {
  const rawValues = Array.isArray(value)
    ? value
    : String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  const unique = [];
  rawValues.forEach((item) => {
    const normalized = normalizeEducationLevelName(item);
    if (!normalized) return;
    if (unique.includes(normalized)) return;
    if (unique.length >= 3) return;
    unique.push(normalized);
  });
  return unique;
}

/**
 * Genera la llave de combinación para temas visuales (ej: 'Primaria+Secundaria').
 * @param {Array} sections - Secciones normalizadas.
 * @returns {string} Llave de combinación o vacío.
 */
export function buildEducationSectionCombinationKey(sections = []) {
  if (sections.length !== 2) return '';
  return [...sections].sort((a, b) => EDUCATION_SECTIONS.indexOf(a) - EDUCATION_SECTIONS.indexOf(b)).join('+');
}

/**
 * Resuelve la clase CSS de tema visual según los niveles educativos.
 * @param {string|Array} sectionOrSections - Niveles del perfil.
 * @returns {string} Clase CSS de tema.
 */
export function resolveEducationThemeClass(sectionOrSections = '') {
  const sections = normalizeEducationSections(sectionOrSections);
  const comboKey = buildEducationSectionCombinationKey(sections);
  if (comboKey && EDUCATION_THEME_CLASS_BY_COMBINATION[comboKey]) {
    return EDUCATION_THEME_CLASS_BY_COMBINATION[comboKey];
  }
  const primary = sections[0] || '';
  return primary ? (EDUCATION_THEME_CLASS_BY_SECTION[primary] || '') : '';
}

/**
 * Obtiene los niveles educativos actuales del perfil del estado.
 * @param {Object} S - Estado global.
 * @returns {Array<string>}
 */
export function getActiveEducationSections(state) {
  const S = state || window.S || {};
  const sections = normalizeEducationSections(S.profile?.educationSections || []);
  if (sections.length) return sections;
  const fallback = normalizeEducationLevelName(S.profile?.educationSection || '');
  return fallback ? [fallback] : [];
}

/**
 * Aplica visualmente el tema de nivel educativo al body del documento.
 * @param {string|Array} section - Niveles a aplicar.
 */
export function applyEducationSectionTheme(section = '') {
  const body = document.body;
  if (!body) return;
  Object.values(EDUCATION_THEME_CLASS_BY_SECTION).forEach((cls) => body.classList.remove(cls));
  Object.values(EDUCATION_THEME_CLASS_BY_COMBINATION).forEach((cls) => body.classList.remove(cls));
  const themeClass = resolveEducationThemeClass(section);
  if (themeClass) body.classList.add(themeClass);
}
