import { S } from '../state.js';
import {
  DEFAULT_ACADEMIC_CALENDAR,
  DEFAULT_PERIODS,
  DEFAULT_SCHOOLS as CONST_DEFAULT_SCHOOLS,
} from '../constants.js';

export function ensurePeriodsAndYear() {
  if (!S.schoolYear || typeof S.schoolYear !== 'object') S.schoolYear = { id: '2025-2026', name: '2025-2026' };
  ensureAcademicCalendar();
  if (!Array.isArray(S.periods) || S.periods.length === 0) S.periods = JSON.parse(JSON.stringify(DEFAULT_PERIODS));
  S.periods.sort((a, b) => (a.order || 99) - (b.order || 99));
  if (!S.activePeriodId || !S.periods.find((p) => p.id === S.activePeriodId)) S.activePeriodId = S.periods[0]?.id || 'P1';
}

export function ensureSchoolCatalog() {
  mergeSchoolsIntoCatalog([]);
  if (typeof window.syncSchoolCatalogFromSql === 'function') window.syncSchoolCatalogFromSql();
}

export function mergeSchoolsIntoCatalog(items = []) {
  if (!Array.isArray(S.schools)) S.schools = [];
  const merged = [...S.schools, ...items, ...CONST_DEFAULT_SCHOOLS].map((n) => String(n || '').trim()).filter(Boolean);
  const uniq = [];
  const seen = new Set();
  merged.forEach((n) => {
    const key = n.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    uniq.push(n);
  });
  S.schools = uniq.sort((a, b) => a.localeCompare(b, 'es'));
}

export function ensureStudentDirectory() {
  if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
  const before = S.studentDirectory.length;
  S.studentDirectory = JSON.parse(JSON.stringify(S.estudiantes || []));
  return S.studentDirectory.length !== before;
}

export function ensureAcademicCalendar() {
  const calendar = normalizeAcademicCalendar(S.academicCalendar);
  S.academicCalendar = calendar;
  const nextPeriods = calendar.periods.map((period) => ({ id: period.id, name: period.name, order: period.order }));
  S.periods = JSON.parse(JSON.stringify(nextPeriods.length ? nextPeriods : DEFAULT_PERIODS));
  if (!S.activePeriodId || !S.periods.find((period) => period.id === S.activePeriodId)) {
    S.activePeriodId = S.periods[0]?.id || 'P1';
  }
  return calendar;
}

function normalizeAcademicCalendar(calendar) {
  if (!calendar || typeof calendar !== 'object') return JSON.parse(JSON.stringify(DEFAULT_ACADEMIC_CALENDAR));
  return calendar;
}
