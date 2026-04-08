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
  mapSectionToSqlPayload 
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
