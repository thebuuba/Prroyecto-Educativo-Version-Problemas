import { S } from './state.js';
import { normTxt } from './utils.js';
import { EDUCATION_SECTIONS, EDUCATION_THEME_CLASS_BY_SECTION, EDUCATION_THEME_CLASS_BY_COMBINATION } from './constants.js';
import { normalizeEducationSections, normalizeEducationSection, normalizeEducationLevelName } from './string-utils.js';

/**
 * --- UI Themes & Scoping ---
 */

export function buildEducationSectionCombinationKey(sections = []) {
  const normalized = normalizeEducationSections(sections);
  if (normalized.length !== 2) return '';
  return [...normalized].sort((a, b) => EDUCATION_SECTIONS.indexOf(a) - EDUCATION_SECTIONS.indexOf(b)).join('+');
}

export function resolveEducationThemeClass(sectionOrSections = '') {
  const sections = normalizeEducationSections(sectionOrSections);
  const comboKey = buildEducationSectionCombinationKey(sections);
  if (comboKey && EDUCATION_THEME_CLASS_BY_COMBINATION[comboKey]) return EDUCATION_THEME_CLASS_BY_COMBINATION[comboKey];
  const primary = sections[0] || '';
  return primary ? (EDUCATION_THEME_CLASS_BY_SECTION[primary] || '') : '';
}

export function getActiveEducationSections() {
  const sections = normalizeEducationSections(S.profile?.educationSections || []);
  if (sections.length) return sections;
  const fallback = normalizeEducationSection(S.profile?.educationSection || '');
  return fallback ? [fallback] : [];
}

export function resolveEducationThemeSection() {
  return getActiveEducationSections();
}

export function applyEducationSectionTheme(section = '') {
  const body = document.body;
  if (!body) return;
  Object.values(EDUCATION_THEME_CLASS_BY_SECTION).forEach((cls) => body.classList.remove(cls));
  Object.values(EDUCATION_THEME_CLASS_BY_COMBINATION).forEach((cls) => body.classList.remove(cls));
  const target = section || resolveEducationThemeSection();
  const themeClass = resolveEducationThemeClass(target);
  if (themeClass) body.classList.add(themeClass);
}

export function shouldScopeByEducationSection() {
  return getActiveEducationSections().length > 0;
}

export function matchesActiveEducationSection(level) {
  if (!shouldScopeByEducationSection()) return true;
  const activeSections = getActiveEducationSections();
  const normalizedLevel = normTxt(normalizeEducationLevelName(level));
  return activeSections.some((section) => normTxt(section) === normalizedLevel);
}

export function getActiveEducationSection() {
  return getActiveEducationSections()[0] || '';
}
