/**
 * Global Delete Handlers
 * Centralized logic for deleting academic entities.
 */

import { S, persist } from './state.js';
import { 
  go, toast, 
  getGroups, sortCourses, getScopedSections, getRosterSections,
  ensurePeriodBuckets,
  debugSessionFlow
} from './domain-utils.js';

/**
 * Elimina un estudiante y limpia su rastro en evaluaciones y notas.
 */
export async function delEst(id) {
  if (!confirm('¿Eliminar estudiante y todas sus calificaciones?')) return;
  
  if (window.AulaBaseSqlApi?.isEnabled?.()) {
    try {
      await window.AulaBaseSqlApi.syncSqlStudentDelete(id);
    } catch (error) {
      console.warn('[EduGest][sql] No se pudo eliminar el estudiante en SQL', error);
      toast('No se pudo eliminar en servidor', true);
      return;
    }
  }

  const before = Array.isArray(S.estudiantes) ? S.estudiantes.length : 0;
  S.estudiantes = (S.estudiantes || []).filter(e => e.id !== id);
  
  // Limpiar notas
  Object.keys(S.notasByPeriod || {}).forEach(pid => {
    if (S.notasByPeriod[pid]) delete S.notasByPeriod[pid][id];
  });
  
  ensurePeriodBuckets(S.activePeriodId);
  S.evaluations = (S.evaluations || []).filter(e => e.studentId !== id);
  
  persist({ immediate: true });
  debugSessionFlow('delete:student', { targetId: id, before, after: S.estudiantes.length });
  
  go('estudiantes');
  toast('Estudiante eliminado');
}

/**
 * Elimina una sección o materia.
 */
export async function delSec(id) {
  const siblingSections = getRosterSections(id).filter(s => s.id !== id);
  const replacementId = siblingSections[0]?.id || '';
  
  const msg = replacementId 
    ? '¿Eliminar esta materia? Los estudiantes se conservarán en la sección compartida.' 
    : '¿Eliminar sección y todos sus estudiantes?';
    
  if (!confirm(msg)) return;

  if (window.AulaBaseSqlApi?.isEnabled?.()) {
    try {
      await window.AulaBaseSqlApi.syncSqlSectionDelete(id);
    } catch (error) {
       toast('Error al eliminar en SQL', true);
       return;
    }
  }

  const studentsToCleanup = replacementId ? [] : S.estudiantes.filter(e => (e.seccionId === id || e.sectionId === id)).map(e => e.id);
  
  // Cleanup evaluations for those students
  S.evaluations = (S.evaluations || []).filter(e => !studentsToCleanup.includes(e.studentId));
  
  if (replacementId) {
    const replacement = S.secciones.find(s => s.id === replacementId);
    S.estudiantes.forEach(student => {
      if (student.courseId === id || student.sectionId === id) {
        student.courseId = replacementId;
        student.sectionId = replacementId;
        student.gradeId = replacement?.gradeId || student.gradeId;
      }
    });
  } else {
    S.estudiantes = S.estudiantes.filter(e => (e.seccionId !== id && e.sectionId !== id));
  }

  S.secciones = S.secciones.filter(s => s.id !== id);
  S.grades.forEach(g => g.sections = (g.sections || []).filter(s => s.id !== id));
  
  Object.keys(S.periodGroupConfigs || {}).forEach(pid => {
    if (S.periodGroupConfigs[pid]) delete S.periodGroupConfigs[pid][id];
  });

  if (S.activeGroupId === id) {
    S.activeGroupId = sortCourses(getScopedSections())[0]?.id || null;
  }

  persist({ immediate: true });
  go('estudiantes');
  toast('Sección eliminada');
}

/**
 * Elimina un grado completo.
 */
export async function delGrade(gradeId) {
  const g = S.grades.find(x => x.id === gradeId);
  if (!g) return;
  
  if (!confirm(`¿Eliminar ${g.name} y todo su contenido?`)) return;

  const secIds = S.secciones.filter(s => s.gradeId === gradeId).map(s => s.id);
  
  if (window.AulaBaseSqlApi?.isEnabled?.()) {
    try { await window.AulaBaseSqlApi.syncSqlGradeDelete(gradeId); } catch(e) {}
  }

  S.estudiantes = S.estudiantes.filter(e => !secIds.includes(e.courseId || e.sectionId));
  S.secciones = S.secciones.filter(s => !secIds.includes(s.id));
  S.grades = S.grades.filter(x => x.id !== gradeId);

  persist({ immediate: true });
  go('estudiantes');
  toast('Grado eliminado');
}

/**
 * Export to window for legacy compatibility
 */
export function initDeleters() {
  window.delEst = delEst;
  window.delSec = delSec;
  window.delGrade = delGrade;
  window.delTpl = (id) => { S.templates = (S.templates || []).filter(t => t.id !== id); persist({ immediate: true }); go('config'); toast('Plantilla eliminada'); };
}
