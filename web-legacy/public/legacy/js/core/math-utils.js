/**
 * Utilidades Matemáticas y de Cálculo Académico.
 * --------------------------------------------------------------------------
 * Este módulo contiene la lógica nuclear para el procesamiento de notas,
 * redondeos, gestión de promedios ponderados y normalización de bloques.
 */

import { S } from './state.js';
import { BLOCKS } from './constants.js';

/**
 * Redondea un número a 2 decimales utilizando el épsilon de máquina para precisión.
 * @param {number|string} n - Número a redondear.
 * @returns {number}
 */
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * Parsea una entrada de texto a decimal, soportando coma como separador.
 * @param {any} val - Valor de entrada.
 * @param {number} [fallback=0] - Valor por defecto si el parseo falla.
 * @returns {number}
 */
export function parseDecimalInput(val, fallback = 0) {
  const n = Number(String(val ?? '').replace(',', '.').trim());
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Formatea un número para visualización, eliminando ceros decimales innecesarios.
 * @param {number} n - Número a formatear.
 * @returns {string} Representación legible (ej. 10 o 9.5).
 */
export function fmtNum(n) {
  const v = round2(n);
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
}

/**
 * Mapea proporcionalmente el puntaje de un instrumento a la escala de la actividad.
 * @param {number} totalScore - Puntaje obtenido en la evaluación.
 * @param {number} maxScore - Puntaje máximo del instrumento.
 * @param {number} activityMax - Peso/Puntos de la actividad en el bloque.
 * @returns {number} Puntaje escalado.
 */
export function mapEvaluationToActivityScore(totalScore, maxScore, activityMax) {
  if (!maxScore || maxScore <= 0) return 0;
  if (maxScore === activityMax) return totalScore;
  return round2((totalScore / maxScore) * activityMax);
}

/**
 * Resuelve la calificación literal dominicana (A, B, C, D) y su clase CSS.
 * @param {number} n - Nota numérica (0-100).
 * @returns {{ l: string, c: string }} Etiqueta literal y nombre de clase.
 */
export function getGrade(n) {
  if (n === null) return { l: '?', c: '' };
  if (n >= 90) return { l: 'A', c: 'gA' };
  if (n >= 75) return { l: 'B', c: 'gB' };
  if (n >= 60) return { l: 'C', c: 'gC' };
  return { l: 'D', c: 'gD' };
}

/**
 * Determina el nivel de desempeño (color) basado en el porcentaje de logro.
 * @param {number} raw - Puntos obtenidos.
 * @param {number} max - Puntos posibles.
 * @returns {string} Identificador de desempeño (h=excelente, o=bueno, w=regular, d=deficiente).
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
 * Obtiene el mapa reactivo de notas para un periodo específico.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {Object} Mapa de notas (StudentId -> ActivityId -> Score).
 */
export function notasMap(periodId = S.activePeriodId) {
  if (!S.notasByPeriod) S.notasByPeriod = {};
  return S.notasByPeriod[periodId] || {};
}

/**
 * Recupera la configuración de pesaje y actividades para un grupo y periodo.
 * @param {string} groupId - ID del grupo/sección.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {Object} Configuración del grupo.
 */
export function getGroupCfg(groupId, periodId = S.activePeriodId) {
  if (!groupId) return { B1: { activities: [] }, B2: { activities: [] }, B3: { activities: [] }, B4: { activities: [] } };
  return S.periodGroupConfigs?.[periodId]?.[groupId] || { B1: { activities: [] }, B2: { activities: [] }, B3: { activities: [] }, B4: { activities: [] } };
}

/**
 * Suma los puntos máximos de todas las actividades configuradas en un bloque.
 * @param {string} b - ID del bloque (B1-B4).
 * @param {string} [groupId=S.activeGroupId] - ID del grupo.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {number} Total de puntos configurados.
 */
export function blockRawMax(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const cfg = getGroupCfg(groupId, periodId)[b];
  return (cfg?.activities || []).reduce((s, a) => s + (parseDecimalInput(a.pts, 0)), 0);
}

/**
 * Retorna el peso meta (ej. 100, 25, 20) para un bloque específico.
 * @param {string} b - ID del bloque.
 * @param {string} [groupId=S.activeGroupId] - ID del grupo.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {number} Meta de puntos.
 */
export function blockMeta(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  return getGroupCfg(groupId, periodId)[b]?.meta || 100;
}

/**
 * Indica si un bloque está configurado para normalizar su promedio a la meta establecida.
 * @returns {boolean}
 */
export function doNormalize(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  return getGroupCfg(groupId, periodId)[b]?.normalize !== false;
}

/**
 * Calcula el puntaje bruto acumulado de un estudiante en un bloque.
 * @param {string} estId - ID del estudiante.
 * @param {string} b - Bloque.
 * @returns {number} Puntos totales sin normalizar.
 */
export function studentBlockRaw(estId, b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const cfg = getGroupCfg(groupId, periodId)[b];
  const nmap = notasMap(periodId);
  return (cfg?.activities || []).reduce((s, a) => s + ((nmap[estId] || {})[a.id] || 0), 0);
}

/**
 * Calcula la calificación final del estudiante en un bloque (aplicando normalización si aplica).
 * @returns {number} Nota final en el bloque.
 */
export function studentBlockScore(estId, b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const raw = studentBlockRaw(estId, b, groupId, periodId);
  const rawMax = blockRawMax(b, groupId, periodId);
  const meta = blockMeta(b, groupId, periodId);
  if (rawMax === 0) return 0;
  return doNormalize(b, groupId, periodId) ? Math.round(raw / rawMax * meta) : raw;
}

/**
 * Calcula el promedio final ponderado del periodo (combinación de todos los bloques).
 * @returns {number|null} Nota final del periodo.
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
 * Calcula el promedio anual de un bloque específico a través de todos los periodos (P1-P4).
 * @returns {number|null} Promedio anual del bloque.
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
 * Calcula la calificación final anual consolidando todos los promedios de bloque.
 * @returns {number|null} Nota anual final.
 */
export function studentAnnualFinal(estId, groupId = S.activeGroupId) {
  const blockScores = BLOCKS
    .map((blockId) => studentAnnualBlockAverage(estId, blockId, groupId))
    .filter((value) => value !== null);
  return blockScores.length ? round2(blockScores.reduce((sum, value) => sum + value, 0) / blockScores.length) : null;
}

/**
 * Calcula el promedio grupal histórico para un bloque específico.
 * @returns {number|null} Promedio de la sección.
 */
export function globalBlockAvg(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const ests = (S.estudiantes || []).filter(s => (s.courseId === groupId || s.sectionId === groupId || s.seccionId === groupId) && s.status !== 'retired');
  if (ests.length === 0) return null;
  const scores = ests.map(e => studentBlockScore(e.id, b, groupId, periodId));
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}

/**
 * Calcula el promedio grupal final del periodo combinando los resultados de todos los estudiantes activos.
 * @returns {number|null} Promedio final de la sección.
 */
export function globalAvg(groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const ests = (S.estudiantes || []).filter(s => (s.courseId === groupId || s.sectionId === groupId || s.seccionId === groupId) && s.status !== 'retired');
  if (ests.length === 0) return null;
  const scores = ests.map(e => studentFinal(e.id, groupId, periodId)).filter(v => v !== null);
  return scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null;
}
