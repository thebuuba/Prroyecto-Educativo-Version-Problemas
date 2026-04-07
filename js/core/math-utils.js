import { S } from './state.js';
import { BLOCKS } from './constants.js';

/**
 * Redondea un número a 2 decimales de forma segura.
 */
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * Parsea un input (con soporte para coma decimal) a un número flotante.
 */
export function parseDecimalInput(val, fallback = 0) {
  const n = Number(String(val ?? '').replace(',', '.').trim());
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Formatea un número eliminando decimales innecesarios (ej: 10.00 -> 10).
 */
export function fmtNum(n) {
  const v = round2(n);
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
}

/**
 * Mapea una calificación de instrumento (sobre X) a una calificación de actividad (sobre Y).
 */
export function mapEvaluationToActivityScore(totalScore, maxScore, activityMax) {
  if (!maxScore || maxScore <= 0) return 0;
  if (maxScore === activityMax) return totalScore;
  return round2((totalScore / maxScore) * activityMax);
}

/**
 * Devuelve la calificación literal (A, B, C, D) para una nota numérica.
 */
export function getGrade(n) {
  if (n === null) return { l: '?', c: '' };
  if (n >= 90) return { l: 'A', c: 'gA' };
  if (n >= 75) return { l: 'B', c: 'gB' };
  if (n >= 60) return { l: 'C', c: 'gC' };
  return { l: 'D', c: 'gD' };
}

/**
 * Devuelve una clase de color descriptiva según el desempeño.
 */
export function scoreClass(raw, max) {
  if (!raw && raw !== 0) return '';
  const r = raw / max;
  if (r >= .9) return 'h';
  if (r >= .75) return 'o';
  if (r >= .6) return 'w';
  return 'd';
}

/**
 * Devuelve el mapa de notas para un periodo específico.
 */
export function notasMap(periodId = S.activePeriodId) {
  if (!S.notasByPeriod) S.notasByPeriod = {};
  return S.notasByPeriod[periodId] || {};
}

/**
 * Devuelve la configuración de grupo para un periodo y sección.
 */
export function getGroupCfg(groupId, periodId = S.activePeriodId) {
  if (!groupId) return { B1: { activities: [] }, B2: { activities: [] }, B3: { activities: [] }, B4: { activities: [] } };
  return S.periodGroupConfigs?.[periodId]?.[groupId] || { B1: { activities: [] }, B2: { activities: [] }, B3: { activities: [] }, B4: { activities: [] } };
}

/**
 * Calcula los puntos máximos totales configurados para un bloque en un grupo.
 */
export function blockRawMax(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const cfg = getGroupCfg(groupId, periodId)[b];
  return (cfg?.activities || []).reduce((s, a) => s + (parseDecimalInput(a.pts, 0)), 0);
}

/**
 * Devuelve el porcentaje de peso meta para un bloque.
 */
export function blockMeta(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  return getGroupCfg(groupId, periodId)[b]?.meta || 100;
}

/**
 * Indica si un bloque debe ser normalizado a su peso meta.
 */
export function doNormalize(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  return getGroupCfg(groupId, periodId)[b]?.normalize !== false;
}

/**
 * Calcula los puntos acumulados (sin normalizar) de un estudiante en un bloque.
 */
export function studentBlockRaw(estId, b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const cfg = getGroupCfg(groupId, periodId)[b];
  const nmap = notasMap(periodId);
  return (cfg?.activities || []).reduce((s, a) => s + ((nmap[estId] || {})[a.id] || 0), 0);
}

/**
 * Calcula la calificación final de un estudiante en un bloque (opcionalmente normalizada).
 */
export function studentBlockScore(estId, b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const raw = studentBlockRaw(estId, b, groupId, periodId);
  const rawMax = blockRawMax(b, groupId, periodId);
  const meta = blockMeta(b, groupId, periodId);
  if (rawMax === 0) return 0;
  return doNormalize(b, groupId, periodId) ? Math.round(raw / rawMax * meta) : raw;
}

/**
 * Calcula la calificación final del periodo para un estudiante.
 */
export function studentFinal(estId, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const cfg = getGroupCfg(groupId, periodId);
  if (BLOCKS.every(b => (cfg[b]?.activities?.length || 0) === 0)) return null;
  const totalMeta = BLOCKS.reduce((s, b) => s + blockMeta(b, groupId, periodId), 0);
  if (totalMeta === 0) return null;
  const weighted = BLOCKS.reduce((s, b) => s + studentBlockScore(estId, b, groupId, periodId) * blockMeta(b, groupId, periodId), 0);
  return Math.round(weighted / totalMeta);
}

/**
 * Calcula el promedio anual de un estudiante para un bloque específico.
 */
export function studentAnnualBlockAverage(estId, b, groupId = S.activeGroupId) {
  const periodIds = ['P1', 'P2', 'P3', 'P4'];
  const scores = periodIds
    .map((periodId) => {
      const cfg = getGroupCfg(groupId, periodId)[b];
      return (cfg?.activities?.length || 0) ? studentBlockScore(estId, b, groupId, periodId) : null;
    })
    .filter((value) => value !== null);
  return scores.length ? round2(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null;
}

/**
 * Calcula la nota final anual de un estudiante.
 */
export function studentAnnualFinal(estId, groupId = S.activeGroupId) {
  const blockScores = BLOCKS
    .map((blockId) => studentAnnualBlockAverage(estId, blockId, groupId))
    .filter((value) => value !== null);
  return blockScores.length ? round2(blockScores.reduce((sum, value) => sum + value, 0) / blockScores.length) : null;
}

/**
 * Calcula el promedio grupal para un bloque.
 */
export function globalBlockAvg(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const ests = (S.estudiantes || []).filter(s => (s.courseId === groupId || s.sectionId === groupId || s.seccionId === groupId) && s.status !== 'retired');
  if (ests.length === 0) return null;
  const scores = ests.map(e => studentBlockScore(e.id, b, groupId, periodId));
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}

/**
 * Calcula el promedio grupal final del periodo.
 */
export function globalAvg(groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const ests = (S.estudiantes || []).filter(s => (s.courseId === groupId || s.sectionId === groupId || s.seccionId === groupId) && s.status !== 'retired');
  if (ests.length === 0) return null;
  const scores = ests.map(e => studentFinal(e.id, groupId, periodId)).filter(v => v !== null);
  return scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null;
}
