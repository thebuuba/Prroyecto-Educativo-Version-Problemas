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
