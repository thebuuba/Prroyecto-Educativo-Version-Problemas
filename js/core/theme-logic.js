/**
 * Lógica de Temas Educativos (UI Themes).
 * --------------------------------------------------------------------------
 * Gestiona la apariencia visual de la interfaz según el nivel educativo 
 * configurado (Primaria, Secundaria, etc.). Aplica clases CSS específicas 
 * al body para cambiar esquemas de colores y estilos.
 */

import { S } from './state.js';
import { normTxt } from './utils.js';
import { EDUCATION_SECTIONS, EDUCATION_THEME_CLASS_BY_SECTION, EDUCATION_THEME_CLASS_BY_COMBINATION } from './constants.js';
import { normalizeEducationSections, normalizeEducationSection, normalizeEducationLevelName } from './string-utils.js';

/**
 * --- Temas de UI y Ámbito ---
 */

/**
 * Construye una llave única para combinaciones de niveles educativos (ej. Primaria + Secundaria).
 * @param {Array} sections - Lista de secciones.
 * @returns {string} Llave normalizada.
 */
export function buildEducationSectionCombinationKey(sections = []) {
  const normalized = normalizeEducationSections(sections);
  if (normalized.length !== 2) return '';
  return [...normalized].sort((a, b) => EDUCATION_SECTIONS.indexOf(a) - EDUCATION_SECTIONS.indexOf(b)).join('+');
}

/**
 * Resuelve la clase CSS correspondiente a una o varias secciones educativas.
 * @param {string|Array} sectionOrSections - Nivel(es) a evaluar.
 * @returns {string} Nombre de la clase CSS.
 */
export function resolveEducationThemeClass(sectionOrSections = '') {
  const sections = normalizeEducationSections(sectionOrSections);
  const comboKey = buildEducationSectionCombinationKey(sections);
  if (comboKey && EDUCATION_THEME_CLASS_BY_COMBINATION[comboKey]) return EDUCATION_THEME_CLASS_BY_COMBINATION[comboKey];
  const primary = sections[0] || '';
  return primary ? (EDUCATION_THEME_CLASS_BY_SECTION[primary] || '') : '';
}

/**
 * Obtiene la lista de niveles educativos activos del perfil del usuario.
 * @returns {Array<string>}
 */
export function getActiveEducationSections() {
  const sections = normalizeEducationSections(S.profile?.educationSections || []);
  if (sections.length) return sections;
  const fallback = normalizeEducationSection(S.profile?.educationSection || '');
  return fallback ? [fallback] : [];
}

/**
 * Alias para obtener las secciones activas.
 */
export function resolveEducationThemeSection() {
  return getActiveEducationSections();
}

/**
 * Aplica el tema visual correspondiente al body del documento.
 * Elimina temas previos y añade el tema detectado o especificado.
 * @param {string|Array} [section=''] - Sección específica (opcional).
 */
export function applyEducationSectionTheme(section = '') {
  const body = document.body;
  if (!body) return;
  Object.values(EDUCATION_THEME_CLASS_BY_SECTION).forEach((cls) => body.classList.remove(cls));
  Object.values(EDUCATION_THEME_CLASS_BY_COMBINATION).forEach((cls) => body.classList.remove(cls));
  const target = section || resolveEducationThemeSection();
  const themeClass = resolveEducationThemeClass(target);
  if (themeClass) body.classList.add(themeClass);
}

/**
 * Indica si el sistema debe filtrar contenidos por nivel educativo.
 * @returns {boolean}
 */
export function shouldScopeByEducationSection() {
  return getActiveEducationSections().length > 0;
}

/**
 * Verifica si un nivel específico coincide con el nivel educativo activo del usuario.
 * @param {string} level - Nivel a comparar.
 * @returns {boolean}
 */
export function matchesActiveEducationSection(level) {
  if (!shouldScopeByEducationSection()) return true;
  const activeSections = getActiveEducationSections();
  const normalizedLevel = normTxt(normalizeEducationLevelName(level));
  return activeSections.some((section) => normTxt(section) === normalizedLevel);
}

/**
 * Retorna el primer nivel educativo activo o cadena vacía.
 * @returns {string}
 */
export function getActiveEducationSection() {
  return getActiveEducationSections()[0] || '';
}
