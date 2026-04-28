/**
 * Integración con la API SQL/RDS (Backend de Persistencia).
 * --------------------------------------------------------------------------
 * Este módulo gestiona la comunicación con el servidor central para la 
 * sincronización de perfiles, asistencia, calificaciones y catálogos escolares.
 */

import { S } from './state.js';
import { isEnabled } from './api-sql/client.js';
import {
  clearAttendanceMonth,
  deleteActivity,
  deleteEvaluations,
  deleteGrade,
  deleteSection,
  deleteStudent,
  loadAcademicSnapshot,
} from './api-sql/academic-endpoints.js';
import {
  ensureSqlAcademicContext,
  getSqlStateContext,
} from './api-sql/context.js';
import { loadStateBlock, syncStateBlock } from './api-sql/state-api.js';

export { getBaseUrl, isEnabled, request } from './api-sql/client.js';
export { loadSchoolCatalog, syncProfile } from './api-sql/bootstrap.js';
export {
  clearAttendanceMonth,
  createActivity,
  createGrade,
  createSection,
  createStudent,
  deleteActivity,
  deleteEvaluations,
  deleteGrade,
  deleteSection,
  deleteStudent,
  loadAcademicSnapshot,
  loadActivities,
  loadAttendance,
  loadEvaluations,
  loadGrades,
  loadSections,
  loadStudents,
  replaceAttendanceMonth,
  updateActivity,
  updateGrade,
  updateSection,
  updateStudent,
  upsertEvaluations,
} from './api-sql/academic-endpoints.js';
export { buildQuery } from './api-sql/query.js';
export {
  cancelSqlAttendanceMonthSync,
  scheduleSqlAttendanceMonthSync,
  syncSqlAttendanceMonth,
} from './api-sql/attendance-sync.js';
export { syncSqlActivityCreateOrUpdate } from './api-sql/activity-sync.js';
export { loadStateBlock, syncStateBlock } from './api-sql/state-api.js';
export {
  ensureSqlAcademicContext,
  ensureSqlSchoolIdForProfile,
  getSqlStateContext,
  isSqlUuidLike,
  normalizeSchoolName,
} from './api-sql/context.js';
export {
  getSqlAuthSession,
  loginSqlAuth,
  logoutSqlAuth,
  registerSqlAuth,
  sendSqlPasswordReset,
} from './api-sql/auth.js';

const SQL_STATE_BLOCK_KEYS = ['assessment', 'planner'];
const SQL_STATE_SYNC_RUNTIME = SQL_STATE_BLOCK_KEYS.reduce((acc, blockKey) => {
  acc[blockKey] = { timer: null, inFlight: false, pending: false };
  return acc;
}, {});

function cloneJson(value, fallback) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return fallback;
  }
}

function normalizeMonthKey(monthKey) {
  return String(monthKey || '').trim().slice(0, 7);
}

function createAttendanceMonthRecord() {
  return {
    slotDays: Array.from({ length: 96 }, () => ''),
    slotMeta: Array.from({ length: 96 }, () => ({ type: '', reason: '' })),
    studentCodes: {},
    retiredCarryOverrides: {},
    retiredPolicy: 'until-retirement',
    scheduleLinked: false,
    visibleCount: 1,
    __normalized: true,
  };
}

function buildSqlAttendanceSnapshot(rows = []) {
  const sectionMonthMap = new Map();
  (rows || []).forEach((row) => {
    const sectionId = String(row?.section_id || '').trim();
    const studentId = String(row?.student_id || '').trim();
    const date = String(row?.attendance_date || '').slice(0, 10);
    if (!sectionId || !studentId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    const monthKey = date.slice(0, 7);
    const key = `${sectionId}::${monthKey}`;
    if (!sectionMonthMap.has(key)) {
      sectionMonthMap.set(key, {
        sectionId,
        monthKey,
        days: new Set(),
        byStudent: new Map(),
      });
    }
    const bucket = sectionMonthMap.get(key);
    const day = date.slice(8, 10).replace(/^0/, '') || '';
    if (!day) return;
    bucket.days.add(day);
    if (!bucket.byStudent.has(studentId)) bucket.byStudent.set(studentId, new Map());
    bucket.byStudent.get(studentId).set(day, String(row?.status || '').trim().toUpperCase());
  });

  const records = {};
  sectionMonthMap.forEach((bucket) => {
    if (!records[bucket.sectionId]) records[bucket.sectionId] = {};
    const record = createAttendanceMonthRecord();
    const days = Array.from(bucket.days).sort((a, b) => Number(a) - Number(b));
    record.slotDays = Array.from({ length: 96 }, (_, idx) => days[idx] || '');
    record.visibleCount = Math.max(1, days.length);
    bucket.byStudent.forEach((codes, studentId) => {
      record.studentCodes[studentId] = Array.from({ length: 96 }, (_, idx) => {
        const day = days[idx];
        return day ? (codes.get(day) || '') : '';
      });
    });
    records[bucket.sectionId][bucket.monthKey] = record;
  });

  return { records };
}

export function buildSqlStateBlockPayload(blockKey) {
  if (blockKey === 'assessment') {
    return {
      periods: cloneJson(S.periods || [], []),
      schoolYear: cloneJson(S.schoolYear || {}, {}),
      academicCalendar: cloneJson(S.academicCalendar || {}, {}),
      activePeriodId: S.activePeriodId || 'P1',
      periodGroupConfigs: cloneJson(S.periodGroupConfigs || {}, {}),
    };
  }
  return {
    teacherPlanner: cloneJson(S.teacherPlanner || { monthKey: '', customEvents: [], weeklySchedule: [] }, { monthKey: '', customEvents: [], weeklySchedule: [] }),
    lessonPlans: cloneJson(S.lessonPlans || [], []),
  };
}

export function applySqlStateBlockPayload(blockKey, payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (blockKey === 'assessment') {
    if (Array.isArray(payload.periods) && payload.periods.length) S.periods = cloneJson(payload.periods, []);
    if (payload.schoolYear && typeof payload.schoolYear === 'object') S.schoolYear = cloneJson(payload.schoolYear, {});
    if (payload.academicCalendar && typeof payload.academicCalendar === 'object') S.academicCalendar = cloneJson(payload.academicCalendar, {});
    if (payload.periodGroupConfigs && typeof payload.periodGroupConfigs === 'object') {
      S.periodGroupConfigs = cloneJson(payload.periodGroupConfigs, {});
    }
    S.activePeriodId = payload.activePeriodId || S.activePeriodId || 'P1';
    return true;
  }
  S.teacherPlanner = payload.teacherPlanner && typeof payload.teacherPlanner === 'object'
    ? cloneJson(payload.teacherPlanner, { monthKey: '', customEvents: [], weeklySchedule: [] })
    : { monthKey: '', customEvents: [], weeklySchedule: [] };
  if (Array.isArray(payload.lessonPlans)) {
    S.lessonPlans = cloneJson(payload.lessonPlans, []);
  }
  return true;
}

export function applySqlAcademicSnapshot(snapshot = {}) {
  const grades = Array.isArray(snapshot.grades) ? snapshot.grades : [];
  const sections = Array.isArray(snapshot.sections) ? snapshot.sections : [];
  const students = Array.isArray(snapshot.students) ? snapshot.students : [];
  const evaluations = Array.isArray(snapshot.evaluations) ? snapshot.evaluations : [];
  const attendance = Array.isArray(snapshot.attendance) ? snapshot.attendance : [];

  const hasData = !!(grades.length || sections.length || students.length || evaluations.length || attendance.length);
  if (!hasData) return false;

  const normalizedGrades = grades
    .map((row) => ({
      id: String(row?.id || '').trim(),
      schoolId: String(row?.school_id || '').trim(),
      educationLevel: String(row?.education_level || '').trim() || 'Primaria',
      name: String(row?.name || '').trim(),
      gradeLevel: Number.isFinite(Number(row?.ordinal)) ? Number(row.ordinal) : null,
      ordinal: Number.isFinite(Number(row?.ordinal)) ? Number(row.ordinal) : null,
      subjectName: '',
      sections: [],
    }))
    .filter((grade) => grade.id && grade.name);

  const gradeById = new Map(normalizedGrades.map((grade) => [grade.id, grade]));
  const normalizedSections = sections
    .map((row) => {
      const gradeId = String(row?.grade_id || '').trim();
      const grade = gradeById.get(gradeId) || null;
      const sectionName = String(row?.name || '').trim();
      return {
        id: String(row?.id || '').trim(),
        schoolId: String(row?.school_id || '').trim(),
        gradeId,
        grado: grade?.name || '',
        gradeLevel: grade?.gradeLevel || null,
        sec: sectionName,
        sectionLetter: sectionName,
        materia: String(row?.subject_name || '').trim() || 'General',
        area: String(row?.subject_area || '').trim(),
        room: '',
        teacherUserId: String(row?.teacher_user_id || '').trim() || null,
      };
    })
    .filter((section) => section.id && section.gradeId);

  normalizedSections.forEach((section) => {
    const grade = gradeById.get(section.gradeId);
    if (!grade) return;
    grade.sections.push({
      id: section.id,
      name: section.sec,
      sectionLetter: section.sectionLetter,
      materia: section.materia,
      area: section.area,
      room: section.room || '',
    });
  });

  const sectionById = new Map(normalizedSections.map((section) => [section.id, section]));
  const normalizedStudents = students
    .map((row) => {
      const section = sectionById.get(String(row?.section_id || '').trim()) || null;
      const firstName = String(row?.first_name || '').trim();
      const middleName = String(row?.middle_name || '').trim();
      const lastName = String(row?.last_name || '').trim();
      return {
        id: String(row?.id || '').trim(),
        schoolId: String(row?.school_id || '').trim(),
        gradeId: String(row?.grade_id || '').trim() || section?.gradeId || null,
        courseId: String(row?.section_id || '').trim(),
        sectionId: String(row?.section_id || '').trim(),
        seccionId: String(row?.section_id || '').trim(),
        nombre: firstName,
        apellido: [middleName, lastName].filter(Boolean).join(' ').trim() || lastName,
        matricula: String(row?.enrollment_code || '').trim(),
        middleName: middleName || null,
        birthDate: String(row?.birth_date || '').trim() || null,
        status: String(row?.status || '').trim() || 'active',
        gradeLevel: section?.gradeLevel || null,
        photoUrl: '',
      };
    })
    .filter((student) => student.id && student.courseId);

  const attendanceSnapshot = buildSqlAttendanceSnapshot(attendance);

  S.grades = normalizedGrades;
  S.secciones = normalizedSections;
  S.estudiantes = normalizedStudents;
  if (evaluations.length) {
    S.evaluations = evaluations.map((row) => ({
      id: String(row?.id || '').trim(),
      schoolId: String(row?.school_id || '').trim(),
      groupId: String(row?.section_id || '').trim(),
      courseId: String(row?.section_id || '').trim(),
      activityId: String(row?.activity_id || '').trim(),
      studentId: String(row?.student_id || '').trim(),
      periodId: String(row?.period_id || 'P1').trim() || 'P1',
      score: Number(row?.score || 0),
      activityScore: Number(row?.score || 0),
      scorePercent: row?.score_percent === null || row?.score_percent === undefined ? null : Number(row.score_percent),
      notes: String(row?.notes || '').trim() || '',
      payload: row?.payload || {},
      evaluatedAt: row?.evaluated_at || null,
    })).filter((entry) => entry.id && entry.activityId && entry.studentId);
  } else {
    S.evaluations = Array.isArray(S.evaluations) ? S.evaluations : [];
  }

  if (attendanceSnapshot?.records && Object.keys(attendanceSnapshot.records).length) {
    S.attendance = {
      ...(S.attendance && typeof S.attendance === 'object' ? S.attendance : { monthKey: normalizeMonthKey(new Date().toISOString().slice(0, 7)), records: {} }),
      records: attendanceSnapshot.records,
      monthKey: Object.keys(attendanceSnapshot.records).flatMap((sectionId) => Object.keys(attendanceSnapshot.records[sectionId] || {}))[0] || S.attendance?.monthKey || normalizeMonthKey(new Date().toISOString().slice(0, 7)),
    };
  }

  return true;
}

export async function hydrateSqlAcademicSnapshotForActiveUser() {
  if (!isEnabled()) return false;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return false;
  const snapshot = await loadAcademicSnapshot({ schoolId: context.schoolId });
  return applySqlAcademicSnapshot(snapshot || {});
}

export async function hydrateSqlStateBlocksForActiveUser() {
  if (!isEnabled()) return false;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return false;
  let changed = false;
  for (const blockKey of SQL_STATE_BLOCK_KEYS) {
    const result = await loadStateBlock(blockKey, context).catch(() => null);
    const payload = result?.payload;
    if (payload && applySqlStateBlockPayload(blockKey, payload)) {
      changed = true;
    }
  }
  return changed;
}

export async function syncSqlActivityDelete(activityId) {
  if (!isEnabled()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  return deleteActivity(activityId, { schoolId: context.schoolId });
}

export async function syncSqlGradeDelete(gradeId) {
  if (!isEnabled()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  return deleteGrade(gradeId, { schoolId: context.schoolId });
}

export async function syncSqlSectionDelete(sectionId) {
  if (!isEnabled()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  return deleteSection(sectionId, { schoolId: context.schoolId });
}

export async function syncSqlStudentDelete(studentId) {
  if (!isEnabled()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  return deleteStudent(studentId, { schoolId: context.schoolId });
}

export async function syncSqlEvaluationsDelete(filters = {}) {
  if (!isEnabled()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  return deleteEvaluations({ schoolId: context.schoolId, ...filters });
}

export async function flushSqlStateBlockSyncs() {
  const pending = [];
  for (const blockKey of SQL_STATE_BLOCK_KEYS) {
    const runtime = SQL_STATE_SYNC_RUNTIME[blockKey];
    if (runtime?.timer) {
      window.clearTimeout(runtime.timer);
      runtime.timer = null;
    }
    if (runtime?.pending || runtime?.payload) {
      pending.push(syncSqlStateBlock(blockKey));
    }
  }
  return Promise.allSettled(pending);
}

export function scheduleSqlStateBlockSyncs() {
  SQL_STATE_BLOCK_KEYS.forEach((blockKey) => scheduleSqlStateBlockSync(blockKey));
}

function scheduleSqlStateBlockSync(blockKey) {
  if (!SQL_STATE_BLOCK_KEYS.includes(blockKey)) return;
  if (!isEnabled()) return;
  const context = getSqlStateContext();
  if (!context?.email || (!context?.schoolId && !context?.schoolName)) return;
  const payload = buildSqlStateBlockPayload(blockKey);
  const runtime = SQL_STATE_SYNC_RUNTIME[blockKey];
  runtime.context = context;
  runtime.payload = payload;
  if (runtime.timer) window.clearTimeout(runtime.timer);
  runtime.timer = window.setTimeout(() => {
    runtime.timer = null;
    syncSqlStateBlock(blockKey).catch(() => null);
  }, 180);
}

async function syncSqlStateBlock(blockKey) {
  const runtime = SQL_STATE_SYNC_RUNTIME[blockKey];
  if (!runtime?.context || !runtime?.payload) return null;
  if (runtime.inFlight) {
    runtime.pending = true;
    return null;
  }
  runtime.inFlight = true;
  try {
    return await syncStateBlock(blockKey, runtime.context, runtime.payload, JSON.stringify(runtime.payload));
  } finally {
    runtime.inFlight = false;
    if (runtime.pending) {
      runtime.pending = false;
      scheduleSqlStateBlockSync(blockKey);
    }
  }
}
