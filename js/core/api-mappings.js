import { S } from './state.js';
import { round2 } from './math-utils.js';
import { findActivity } from './academic-logic.js';
import { ensureSqlAcademicContext, syncSqlActivityCreateOrUpdate } from './api-sql.js';

/**
 * API Mapping Helpers
 * --------------------------------------------------------------------------
 */

export function mapGradeToSqlPayload(grade, schoolId) {
  return {
    schoolId,
    educationLevel: String(grade?.educationLevel || 'Primaria').trim() || 'Primaria',
    name: String(grade?.name || '').trim(),
    ordinal: Number.isFinite(Number(grade?.gradeLevel)) ? Number(grade.gradeLevel) : Number.isFinite(Number(grade?.ordinal)) ? Number(grade.ordinal) : null,
  };
}

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

export function normalizeSqlEvaluationScorePercent(evaluation, activity = null) {
  const explicit = Number(evaluation?.scorePercent ?? evaluation?.score_percent);
  if (Number.isFinite(explicit)) return explicit;
  const score = Number(evaluation?.activityScore ?? evaluation?.score ?? 0);
  const max = Number(activity?.pts ?? evaluation?.activityPoints ?? 0);
  if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return null;
  return round2((score / max) * 100);
}

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
 * Sincroniza una evaluación con la API de SQL.
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
