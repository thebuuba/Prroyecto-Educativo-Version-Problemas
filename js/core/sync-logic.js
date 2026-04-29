/**
 * Orquestador de Sincronización de Alto Nivel (EduGest Sync Logic).
 * --------------------------------------------------------------------------
 * Este módulo actúa como puente entre los mapeadores de API y los servicios 
 * de red SQL, gestionando la creación y actualización recursiva de entidades 
 * académicas (Grados, Secciones, Estudiantes).
 */

import * as SQL from './api-sql.js';
import { 
  mapGradeToSqlPayload, 
  mapSectionToSqlPayload,
  mapStudentToSqlPayload
} from './api-mappings.js';
import {
  isSqlUuidLike,
  rememberSqlId,
  resolveEntitySqlId,
  resolveGradeSqlId,
  resolveSectionSqlId,
} from './sql-id-utils.js';

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
