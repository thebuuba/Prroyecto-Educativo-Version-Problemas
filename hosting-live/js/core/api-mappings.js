/**
 * Mapeadores de Datos para la API SQL.
 * --------------------------------------------------------------------------
 * Este módulo contiene las funciones de transformación necesarias para 
 * convertir los objetos del estado interno (NoSQL/Local) a los esquemas 
 * requeridos por la base de datos relacional (SQL).
 */

import { S } from './state.js';
import { round2 } from './math-utils.js';
import { findActivity } from './academic-logic.js';
import { ensureSqlAcademicContext, syncSqlActivityCreateOrUpdate } from './api-sql.js';

/**
 * Transforma un objeto de Grado al esquema de carga para SQL.
 * @param {Object} grade - Objeto de grado local.
 * @param {string} schoolId - ID del centro educativo.
 * @returns {Object} Payload para la API SQL.
 */
export function mapGradeToSqlPayload(grade, schoolId) {
  return {
    schoolId,
    educationLevel: String(grade?.educationLevel || 'Primaria').trim() || 'Primaria',
    name: String(grade?.name || '').trim(),
    ordinal: Number.isFinite(Number(grade?.gradeLevel)) ? Number(grade.gradeLevel) : Number.isFinite(Number(grade?.ordinal)) ? Number(grade.ordinal) : null,
  };
}

/**
 * Transforma un objeto de Sección/Materia al esquema de carga para SQL.
 * @param {Object} section - Objeto de sección local.
 * @param {string} schoolId - ID del centro.
 * @param {string} gradeId - ID del grado padre en SQL.
 * @returns {Object} Payload para la API SQL.
 */
export function mapSectionToSqlPayload(section, schoolId, gradeId) {
  return {
    schoolId,
    gradeId,
    name: String(section?.sec || section?.name || '').trim(),
    subjectArea: String(section?.area || '').trim() || null,
    subjectName: String(section?.materia || '').trim() || null,
    teacherUserId: String(section?.teacherUserId || S.sessionUserId || '').trim() || null,
  };
}

/**
 * Transforma un objeto de Estudiante al esquema de carga para SQL.
 * @param {Object} student - Objeto de estudiante local.
 * @param {string} schoolId - ID del centro.
 * @param {string} gradeId - ID del grado.
 * @param {string} sectionId - ID de la sección.
 * @returns {Object} Payload para la API SQL.
 */
export function mapStudentToSqlPayload(student, schoolId, gradeId, sectionId) {
  return {
    schoolId,
    gradeId,
    sectionId,
    enrollmentCode: String(student?.matricula || '').trim() || null,
    firstName: String(student?.nombre || '').trim(),
    lastName: String(student?.apellido || '').trim(),
    middleName: String(student?.middleName || '').trim() || null,
    birthDate: String(student?.birthDate || '').trim() || null,
    status: String(student?.status || 'active').trim() || 'active',
  };
}

/**
 * Transforma una Actividad pedagógica al esquema de carga para SQL.
 * @param {Object} activity - Objeto de actividad local.
 * @param {Object} [meta={}] - Metadatos de contexto (schoolId, sectionId, periodId, blockKey).
 * @returns {Object} Payload para la API SQL.
 */
export function mapActivityToSqlPayload(activity, meta = {}) {
  return {
    schoolId: String(meta.schoolId || '').trim(),
    sectionId: String(meta.sectionId || activity?.courseId || '').trim(),
    teacherUserId: String(meta.teacherUserId || '').trim() || null,
    periodId: String(meta.periodId || activity?.periodId || 'P1').trim() || 'P1',
    blockKey: String(meta.blockKey || '').trim() || null,
    name: String(activity?.name || '').trim(),
    description: String(activity?.desc || activity?.description || '').trim() || null,
    points: Number.isFinite(Number(activity?.pts)) ? Number(activity.pts) : 0,
    activityType: String(activity?.tipo || activity?.activityType || '').trim() || null,
    scheduledDate: String(activity?.fecha || activity?.scheduledDate || '').trim() || null,
  };
}

/**
 * Calcula el porcentaje de logro de una evaluación de forma normalizada para SQL.
 * @param {Object} evaluation - Objeto de evaluación.
 * @param {Object} [activity=null] - Actividad asociada para referencia de puntos.
 * @returns {number|null} Porcentaje (0-100).
 */
export function normalizeSqlEvaluationScorePercent(evaluation, activity = null) {
  const explicit = Number(evaluation?.scorePercent ?? evaluation?.score_percent);
  if (Number.isFinite(explicit)) return explicit;
  const score = Number(evaluation?.activityScore ?? evaluation?.score ?? 0);
  const max = Number(activity?.pts ?? evaluation?.activityPoints ?? 0);
  if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return null;
  return round2((score / max) * 100);
}

/**
 * Transforma un registro de Evaluación al esquema de carga para SQL.
 * @param {Object} evaluation - Registro de calificación.
 * @param {Object} [meta={}] - Metadatos de contexto y actividad.
 * @returns {Object} Payload completo para sincronización SQL.
 */
export function mapEvaluationToSqlPayload(evaluation, meta = {}) {
  const activity = meta.activity || null;
  const activityScore = Number(evaluation?.activityScore ?? evaluation?.score ?? 0);
  const activityPoints = Number(activity?.pts ?? evaluation?.activityPoints ?? 0);
  const payload = {
    ...structuredClone(evaluation || {}),
    activityPoints,
    activityScore: Number.isFinite(activityScore) ? activityScore : 0,
  };
  return {
    schoolId: String(meta.schoolId || '').trim(),
    sectionId: String(meta.sectionId || evaluation?.groupId || evaluation?.courseId || '').trim(),
    activityId: String(evaluation?.activityId || '').trim(),
    studentId: String(evaluation?.studentId || '').trim(),
    periodId: String(evaluation?.periodId || 'P1').trim() || 'P1',
    score: Number.isFinite(activityScore) ? activityScore : 0,
    scorePercent: normalizeSqlEvaluationScorePercent(evaluation, activity),
    notes: String(evaluation?.teacherCommentGeneral || evaluation?.notes || '').trim() || null,
    payload,
    evaluatedAt: String(evaluation?.evaluatedAt || evaluation?.timestamp || evaluation?.createdAt || '').trim() || null,
  };
}

/**
 * Sincroniza una evaluación con la API de SQL de forma asíncrona.
 * Asegura que el contexto académico y la actividad existan en SQL antes de guardar la nota.
 * @param {Object} evaluation - Registro a sincronizar.
 * @param {Object} [meta={}] - Metadatos adicionales.
 * @returns {Promise<Object|null>} Respuesta de la API o null.
 */
export async function syncSqlEvaluationUpsert(evaluation, meta = {}) {
  if (!window.AulaBaseSqlApi?.isEnabled?.() || typeof window.AulaBaseSqlApi.upsertEvaluations !== 'function') return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  const sectionId = String(meta.sectionId || evaluation?.groupId || evaluation?.courseId || '').trim();
  if (!sectionId) return null;
  let activity = meta.activity || null;
  if (!activity && evaluation?.activityId) {
    const found = findActivity(evaluation.activityId, sectionId, evaluation?.periodId || S.activePeriodId);
    activity = found?.activity || null;
  }
  if (activity?.id) {
    await syncSqlActivityCreateOrUpdate(activity, {
      schoolId: context.schoolId,
      sectionId,
      periodId: String(meta.periodId || evaluation?.periodId || S.activePeriodId || 'P1').trim() || 'P1',
      blockKey: meta.blockKey || null,
    });
  }
  const payload = mapEvaluationToSqlPayload(evaluation, {
    schoolId: context.schoolId,
    sectionId,
    activity,
  });
  if (!payload.activityId || !payload.studentId) return null;
  return window.AulaBaseSqlApi.upsertEvaluations(payload);
}
