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
import { isSqlUuidLike } from './api-sql.js';

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
  const isUpdatingGrade = isSqlUuidLike(grade?.id);

  let gradeResult = null;
  if (isUpdatingGrade) {
    gradeResult = await SQL.updateGrade(grade.id, gradePayload);
  } else {
    gradeResult = await SQL.createGrade(gradePayload);
  }

  // Si el servidor devolvió un nuevo ID (ej: al crear), lo usamos para la sección
  const sqlGradeId = gradeResult?.id || grade.id;

  const sectionPayload = mapSectionToSqlPayload(section, schoolId, sqlGradeId);
  const isUpdatingSection = isSqlUuidLike(section?.id);

  let sectionResult = null;
  if (isUpdatingSection) {
    sectionResult = await SQL.updateSection(section.id, sectionPayload);
  } else {
    sectionResult = await SQL.createSection(sectionPayload);
  }

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
  const isUpdate = isSqlUuidLike(student.id);

  let result = null;
  if (isUpdate) {
    result = await SQL.updateStudent(student.id, payload);
  } else {
    result = await SQL.createStudent(payload);
  }

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

  const payload = mapSectionToSqlPayload(section, context.schoolId, section.gradeId);
  const isUpdate = isSqlUuidLike(section.id);

  let result = null;
  if (isUpdate) {
    result = await SQL.updateSection(section.id, payload);
  } else {
    result = await SQL.createSection(payload);
  }

  return result || section;
}
