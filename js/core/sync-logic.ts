/**
 * Orquestador de Sincronización de Alto Nivel (EduGest Sync Logic).
 * --------------------------------------------------------------------------
 * Este módulo actúa como puente entre los mapeadores de API y los servicios 
 * de red SQL, gestionando la creación y actualización recursiva de entidades 
 * académicas (Grados, Secciones, Estudiantes).
 */

import * as SQL from './api-sql.ts';
import { S } from './state.ts';
import { 
  mapGradeToSqlPayload, 
  mapSectionToSqlPayload,
  mapStudentToSqlPayload
} from './api-mappings.ts';
import {
  isSqlUuidLike,
  rememberSqlId,
  resolveEntitySqlId,
  resolveGradeSqlId,
  resolveSectionSqlId,
} from './sql-id-utils.ts';

/**
 * Sincroniza un Grado y su Sección principal con el servidor SQL.
 * Gestiona de forma inteligente si debe crear o actualizar basándose en el ID.
 * 
 * @param {Object} grade - Objeto de grado local del estado (S).
 * @param {Object} section - Objeto de sección local asociado.
 * @returns {Promise<Object>} Resultado de la operación con los IDs asignados por el servidor.
 */
export async function syncSqlGradeCreateOrUpdate(grade, section) {
  if (!SQL.isEnabled()) return { grade, section };

  const context = await SQL.ensureSqlAcademicContext();
  if (!context?.schoolId) {
    console.warn('[EduGest][sync] No se pudo asegurar el contexto escolar.');
    return { grade, section };
  }

  const schoolId = context.schoolId;
  const gradePayload = mapGradeToSqlPayload(grade, schoolId);
  const gradeSqlId = resolveEntitySqlId(grade);
  const isUpdatingGrade = isSqlUuidLike(gradeSqlId);

  let gradeResult = null;
  if (isUpdatingGrade) {
    gradeResult = await SQL.updateGrade(gradeSqlId, gradePayload);
  } else {
    gradeResult = await SQL.createGrade(gradePayload);
  }
  rememberSqlId(grade, gradeResult?.id);

  const sqlGradeId = resolveEntitySqlId(grade) || gradeResult?.id || grade.id;

  const sectionPayload = mapSectionToSqlPayload(section, schoolId, sqlGradeId);
  const sectionSqlId = resolveEntitySqlId(section);
  const isUpdatingSection = isSqlUuidLike(sectionSqlId);

  let sectionResult = null;
  if (isUpdatingSection) {
    sectionResult = await SQL.updateSection(sectionSqlId, sectionPayload);
  } else {
    sectionResult = await SQL.createSection(sectionPayload);
  }
  rememberSqlId(section, sectionResult?.id);

  return {
    grade: gradeResult || grade,
    section: sectionResult || section
  };
}

/**
 * Sincroniza un Estudiante con el servidor SQL.
 * @param {Object} student - Objeto de estudiante local.
 * @returns {Promise<Object>} Estudiante actualizado con ID de SQL.
 */
export async function syncSqlStudentCreateOrUpdate(student) {
  if (!SQL.isEnabled()) return student;

  const context = await SQL.ensureSqlAcademicContext();
  if (!context?.schoolId) return student;

  const sectionId = student.sectionId || student.seccionId || student.courseId;
  const gradeId = student.gradeId;
  
  const payload = mapStudentToSqlPayload(student, context.schoolId, gradeId, sectionId);
  if (!payload.gradeId || !payload.sectionId) return student;

  const studentSqlId = resolveEntitySqlId(student);
  const isUpdate = isSqlUuidLike(studentSqlId);

  let result = null;
  if (isUpdate) {
    result = await SQL.updateStudent(studentSqlId, payload);
  } else {
    result = await SQL.createStudent(payload);
  }
  rememberSqlId(student, result?.id);

  return result || student;
}

/**
 * Sincroniza una Sección independiente con el servidor SQL.
 * @param {Object} section - Objeto de sección local.
 * @returns {Promise<Object>} Sección actualizada con ID de SQL.
 */
export async function syncSqlSectionCreateOrUpdate(section) {
  if (!SQL.isEnabled()) return section;

  const context = await SQL.ensureSqlAcademicContext();
  if (!context?.schoolId) return section;

  const sqlGradeId = resolveGradeSqlId(section.gradeId);
  if (!sqlGradeId) return section;

  const payload = mapSectionToSqlPayload(section, context.schoolId, sqlGradeId);
  const sectionSqlId = resolveSectionSqlId(section);
  const isUpdate = isSqlUuidLike(sectionSqlId);

  let result = null;
  if (isUpdate) {
    result = await SQL.updateSection(sectionSqlId, payload);
  } else {
    result = await SQL.createSection(payload);
  }
  rememberSqlId(section, result?.id);

  return result || section;
}

/**
 * Resincroniza las entidades académicas locales contra SQL.
 * Útil cuando un cambio anterior quedó solo en IndexedDB/localStorage por un
 * fallo transitorio de red o por restricciones SQL ya corregidas.
 */
export async function syncSqlAcademicEntitiesForActiveUser() {
  if (!SQL.isEnabled()) return { ok: false, reason: 'disabled' };

  const context = await SQL.ensureSqlAcademicContext();
  if (!context?.schoolId) return { ok: false, reason: 'missing-context' };

  let grades = 0;
  let sections = 0;
  let students = 0;

  const localGrades = Array.isArray(S.grades) ? S.grades : [];
  const localSections = Array.isArray(S.secciones) ? S.secciones : [];
  const localStudents = Array.isArray(S.estudiantes) ? S.estudiantes : [];

  for (const grade of localGrades) {
    const payload = mapGradeToSqlPayload(grade, context.schoolId);
    if (!payload.name) continue;
    const gradeSqlId = resolveEntitySqlId(grade);
    const result = isSqlUuidLike(gradeSqlId)
      ? await SQL.updateGrade(gradeSqlId, payload)
      : await SQL.createGrade(payload);
    if (rememberSqlId(grade, result?.id)) grades += 1;
  }

  for (const section of localSections) {
    const sqlGradeId = resolveGradeSqlId(section?.gradeId);
    if (!sqlGradeId) continue;
    const payload = mapSectionToSqlPayload(section, context.schoolId, sqlGradeId);
    if (!payload.name || !payload.gradeId) continue;
    const sectionSqlId = resolveSectionSqlId(section);
    const result = isSqlUuidLike(sectionSqlId)
      ? await SQL.updateSection(sectionSqlId, payload)
      : await SQL.createSection(payload);
    if (rememberSqlId(section, result?.id)) sections += 1;
  }

  for (const student of localStudents) {
    const gradeId = resolveGradeSqlId(student?.gradeId);
    const sectionId = resolveSectionSqlId(student?.sectionId || student?.seccionId || student?.courseId);
    if (!gradeId || !sectionId) continue;
    const payload = mapStudentToSqlPayload(student, context.schoolId, gradeId, sectionId);
    if (!payload.firstName || !payload.lastName || !payload.gradeId || !payload.sectionId) continue;
    const studentSqlId = resolveEntitySqlId(student);
    const result = isSqlUuidLike(studentSqlId)
      ? await SQL.updateStudent(studentSqlId, payload)
      : await SQL.createStudent(payload);
    if (rememberSqlId(student, result?.id)) students += 1;
  }

  return { ok: true, grades, sections, students };
}
