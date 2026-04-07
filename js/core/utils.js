// General utility functions for EduGest

// Scheduling
export const scheduleNonCriticalTask = (() => {
  if (typeof window.requestIdleCallback === 'function') {
    return (task, timeout = 180) => window.requestIdleCallback(() => task(), { timeout });
  }
  return (task) => window.setTimeout(task, 32);
})();

// Libraries
let xlsxLibraryPromise = null;
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

// Error Handling
export function errorMessage(error, fallback = 'No se pudo completar la acción.') {
  if (window.EduGestCloud?.friendlyError) {
    const cloudMessage = String(window.EduGestCloud.friendlyError(error) || '').trim();
    if (cloudMessage) return cloudMessage;
  }
  const directMessage = String(error?.message || '').trim();
  if (directMessage) return directMessage;
  return fallback;
}

export function reportError(context, error, options = {}) {
  const { fallback = 'No se pudo completar la acción.', tone = 'error' } = options;
  console.error(`[EduGest][${context}]`, error);
  if (window.toast) window.toast(`${errorMessage(error, fallback)}`, tone);
}

// UI & HTML
export function escapeHtml(value) {
  const text = fixMojibakeText(String(value == null ? '' : value));
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isEditableTarget(el) {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = String(el.tagName || '').toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

// Text & Mojibake Repair
export function hasMojibakeMarkers(str) {
  if (typeof str !== 'string') return false;
  return /(?:\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]|\u00E2[\u0080-\u00BF]{1,2}|\u00F0[\u0080-\u00BF]{2,3}|\uFFFD)/.test(str);
}

export function decodeCp1252Utf8(str) {
  try {
    const bytes = new Uint8Array(Array.from(str, ch => ch.charCodeAt(0) & 255));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (_) {
    return str;
  }
}

export function scoreMojibake(str) {
  if (typeof str !== 'string') return 0;
  const markers = ['Ã','Â','â','ð','ï?½'];
  return markers.reduce((acc, m) => {
    const parts = str.split(m);
    return acc + (parts.length > 1 ? parts.length - 1 : 0);
  }, 0);
}

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

export function nowIso() {
  return new Date().toISOString();
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

export function uniqueValues(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.filter(Boolean))];
}

export function normTxt(str) {
  if (typeof str !== 'string') return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

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

export function parseSection(sec = '') {
  const s = String(sec || '').trim().toUpperCase();
  if (!s) return 'A';
  const m = s.match(/[A-Z]/);
  return m ? m[0] : 'A';
}

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

// Debugging & Logging
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

export function debugSessionFlow(event, payload = {}) {
  if (!isSessionDebugEnabled()) return;
  try {
    console.info(`[EduGest][session-debug] ${event}`, payload);
  } catch (_) {}
}

export function debugAuthFlow(event, payload = {}) {
  if (!isAuthDebugEnabled()) return;
  try {
    console.info(`[EduGest][auth-debug] ${event}`, payload);
  } catch (_) {}
}

// Auth Helpers
export function authEmailKey(email) {
  return String(email || '').trim().toLowerCase();
}

export function formatMsToMinSec(ms = 0) {
  const safeMs = Math.max(0, Number(ms) || 0);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (!minutes) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export function normalizeAuthAccessMode(mode) {
  const value = String(mode || '').trim().toLowerCase();
  const valid = ['google', 'facebook', 'local', 'email'];
  return valid.includes(value) ? value : '';
}

export function canUseCloudAuth() {
  return !!window.EduGestCloud?.isConfigured?.();
}

export function shouldFallbackToLocalAuth(error) {
  const code = String(error?.code || '').trim();
  const fallbackCodes = new Set([
    'auth/configuration-not-found',
    'auth/operation-not-allowed',
    'auth/network-request-failed',
  ]);
  return fallbackCodes.has(code);
}
