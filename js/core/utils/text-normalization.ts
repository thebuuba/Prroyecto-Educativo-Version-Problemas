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
