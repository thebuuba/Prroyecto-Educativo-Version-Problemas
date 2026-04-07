/**
 * Lógica de Calendario Académico y Gestión de Actividades.
 * --------------------------------------------------------------------------
 * Este módulo gestiona la normalización de periodos escolares, el calendario 
 * de asistencia y la manipulación de registros de actividades y evaluaciones.
 */

import { S } from './state.js';
import { uid, nowIso } from './utils.js';
import { getGroupCfg } from './math-utils.js';
import { BLOCKS, DEFAULT_ACADEMIC_CALENDAR, DEFAULT_PERIODS } from './constants.js';

/**
 * Normaliza el calendario académico para asegurar una estructura predecible.
 * @param {Object} input - Datos del calendario a normalizar.
 * @returns {Object} Calendario normalizado con periodos y meses activos.
 */
export function normalizeAcademicCalendar(input) {
  const base = JSON.parse(JSON.stringify(DEFAULT_ACADEMIC_CALENDAR));
  const next = input && typeof input === 'object' ? JSON.parse(JSON.stringify(input)) : {};
  const rawPeriods = Array.isArray(next.periods) && next.periods.length ? next.periods : base.periods;
  
  const periods = rawPeriods
    .map((period, index) => {
      const months = Array.isArray(period?.months) ? period.months : [];
      const cleanMonths = months
        .map((value) => parseInt(value, 10))
        .filter((value, monthIndex, list) => value >= 1 && value <= 12 && list.indexOf(value) === monthIndex);
      return {
        id: String(period?.id || base.periods[index]?.id || `P${index + 1}`),
        name: String(period?.name || base.periods[index]?.name || `Periodo ${index + 1}`),
        order: Number.isFinite(parseInt(period?.order, 10)) ? parseInt(period.order, 10) : (index + 1),
        months: cleanMonths.length ? cleanMonths : [...(base.periods[index]?.months || [])],
      };
    })
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  const activeMonths = (Array.isArray(next.activeMonths) ? next.activeMonths : periods.flatMap((period) => period.months))
    .map((value) => parseInt(value, 10))
    .filter((value, index, list) => value >= 1 && value <= 12 && list.indexOf(value) === index);

  return {
    country: String(next.country || base.country || 'DO'),
    activeMonths: activeMonths.length ? activeMonths : [...base.activeMonths],
    periods: periods.length ? periods : JSON.parse(JSON.stringify(base.periods)),
  };
}

/**
 * Garantiza que el calendario académico esté sincronizado con el estado global S.
 * @returns {Object} El calendario académico actualizado.
 */
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

/**
 * Obtiene los periodos del calendario académico actual.
 * @returns {Array} Lista de objetos de periodo.
 */
export function academicCalendarPeriods() {
  return ensureAcademicCalendar().periods;
}

/**
 * Determina qué meses están marcados como activos para la asistencia.
 * @returns {Array<string>} Lista de meses (ej. ['08', '09']).
 */
export function academicCalendarActiveMonths() {
  const settings = S.calendarSettings || {};
  return Array.isArray(settings.activeMonths) ? settings.activeMonths : ['08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06'];
}

/**
 * Verifica si un mes dado (formato YYYY-MM) está dentro del calendario activo.
 * @param {string} monthKey - Clave del mes.
 * @returns {boolean}
 */
export function isAcademicMonthActive(monthKey) {
  const month = String(monthKey || '').split('-')[1];
  return academicCalendarActiveMonths().includes(month);
}

/**
 * Sugiere el ID de periodo (P1, P2...) correspondiente a un mes del calendario.
 * @param {string} monthKey - Clave del mes.
 * @returns {string|null}
 */
export function suggestedAcademicPeriodIdForMonth(monthKey) {
  const month = String(monthKey || '').split('-')[1];
  const map = S.calendarSettings?.periodMonthMap || {
    '08': 'P1', '09': 'P1', '10': 'P1',
    '11': 'P2', '12': 'P2', '01': 'P2',
    '02': 'P3', '03': 'P3', '04': 'P3',
    '05': 'P4', '06': 'P4'
  };
  return map[month] || null;
}

/**
 * Retorna el nombre legible de un mes a partir de su clave.
 * @param {string} monthKey - Clave del mes.
 * @returns {string} Nombre en español.
 */
export function plannerMonthLabel(monthKey) {
  const month = String(monthKey || '').split('-')[1];
  const names = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };
  return names[month] || month;
}

/**
 * Busca una actividad específica dentro de los bloques de un grupo.
 * @param {string} actId - ID de la actividad.
 * @param {string} [groupId=S.activeGroupId] - ID del grupo.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {Object|null} Metadatos de la actividad encontrada.
 */
export function findActivity(actId, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const cfg = getGroupCfg(groupId, periodId);
  for (const b of BLOCKS) {
    const idx = (cfg[b]?.activities || []).findIndex(a => a.id === actId);
    if (idx >= 0) return { block: b, index: idx, activity: cfg[b].activities[idx] };
  }
  return null;
}

/**
 * Calcula el número total de actividades registradas para un grupo en el periodo actual.
 * @param {string} [groupId=S.activeGroupId] - ID del grupo.
 * @returns {number}
 */
export function totalActs(groupId = S.activeGroupId) {
  const cfg = getGroupCfg(groupId, S.activePeriodId);
  return BLOCKS.reduce((s, b) => s + (cfg[b]?.activities?.length || 0), 0);
}

/**
 * Obtiene el listado completo de todas las actividades (con su bloque) para un periodo.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {Array<{ block: string, activity: Object }>}
 */
export function allActivities(periodId = S.activePeriodId) {
  const out = [];
  const cfg = getGroupCfg(S.activeGroupId, periodId);
  BLOCKS.forEach((b) => {
    (cfg[b]?.activities || []).forEach((a) => out.push({ block: b, activity: a }));
  });
  return out;
}

/**
 * Registra o actualiza una evaluación localmente tanto en el histórico (S.evaluations)
 * como en la caché rápida de notas (S.notasByPeriod).
 * @param {Object} payload - Datos de la evaluación (studentId, activityId, score, etc.).
 * @returns {Object} El registro de evaluación final guardado.
 */
export function upsertLocalEvaluationRecord(payload) {
  if (!payload || !payload.activityId || !payload.studentId) return null;
  const periodId = String(payload.periodId || S.activePeriodId || 'P1').trim() || 'P1';
  
  const keyMatches = (entry) =>
    entry.activityId === payload.activityId &&
    entry.studentId === payload.studentId &&
    (entry.periodId || 'P1') === periodId &&
    String(entry.groupId || entry.courseId || '') === String(payload.groupId || payload.courseId || S.activeGroupId || '');
    
  const idx = S.evaluations.findIndex(keyMatches);
  const next = {
    ...payload,
    periodId,
    groupId: payload.groupId || payload.courseId || S.activeGroupId || null,
    courseId: payload.courseId || payload.groupId || S.activeGroupId || null,
    score: Number.isFinite(Number(payload.score)) ? Number(payload.score) : Number(payload.activityScore || 0),
    activityScore: Number.isFinite(Number(payload.activityScore)) ? Number(payload.activityScore) : Number(payload.score || 0),
    updatedAt: nowIso(),
  };

  if (idx >= 0) {
    next.id = S.evaluations[idx].id || next.id || uid();
    next.createdAt = S.evaluations[idx].createdAt || next.createdAt || nowIso();
    S.evaluations[idx] = next;
  } else {
    next.id = next.id || uid();
    next.createdAt = next.createdAt || nowIso();
    S.evaluations.push(next);
  }

  // Sincronización con el mapa rápido de notas para Reactividad en Paneles
  if (!S.notasByPeriod) S.notasByPeriod = {};
  if (!S.notasByPeriod[periodId]) S.notasByPeriod[periodId] = {};
  if (!S.notasByPeriod[periodId][next.studentId]) S.notasByPeriod[periodId][next.studentId] = {};
  S.notasByPeriod[periodId][next.studentId][next.activityId] = next.activityScore;

  return next;
}
