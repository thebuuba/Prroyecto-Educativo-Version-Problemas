/**
 * Lógica de Gestión de Grados y Secciones (EduGest Grade Logic).
 * --------------------------------------------------------------------------
 * Este módulo centraliza la creación, persistencia y validación de la 
 * estructura académica. Reemplaza al motor legado 'saveGrade' permitiendo 
 * la coexistencia con la arquitectura modular.
 */

import { S } from './state.js';
import { 
  v, 
  normTxt, 
  uid, 
  parseSection, 
  parseGradeLevel, 
  normalizeEducationLevelName, 
  getActiveEducationSections,
  toast,
  persist,
  go,
  closeM,
  DEFAULT_PERIODS,
  emptyGroupCfg
} from './domain-utils.js';
import { ensurePeriodsAndYear } from './hydration.js';
import { ensurePeriodBuckets } from './academic-context-logic.js';
import { syncSqlGradeCreateOrUpdate } from './sync-logic.js';

/**
 * Variables de estado persistentes para el seguimiento de la UI.
 */
export const SECTION_STUDENT_PANEL_OPEN = {};

/**
 * Marca una sección como recientemente creada para resaltar en la UI.
 * @param {string} sectionId 
 */
export function markRecentCreatedSection(sectionId) {
  if (!sectionId) return;
  window.localStorage?.setItem('eg_last_created_sec', sectionId);
}

/**
 * Guarda un nuevo Grado y su Sección asociada en el sistema.
 * Realiza validaciones, inicializa periodos escolares y sincroniza con el servidor SQL.
 * 
 * Basado en el motor de app-core.js:9458
 */
export async function saveGrade(payload = null) {
  const name = payload?.grade || v('gr-grade-num');
  const rawLevel = payload?.level || v('gr-edu-level');
  const educationLevel = normalizeEducationLevelName(rawLevel);
  const sectionValue = String(payload?.section || v('gr-section') || '').trim();
  const sectionLetter = parseSection(sectionValue);
  
  // Áreas y Materias
  const area = String(payload?.area || document.getElementById('gr-area')?.value || '').trim();
  const rawSubject = payload?.subject || document.getElementById('gr-subject')?.value || '';
  const materia = String(rawSubject).trim();
  const room = String(payload?.room || v('gr-room')).trim();
  
  const allowedSections = getActiveEducationSections(S);

  // 1. Validaciones de Negocio
  if (!name || !educationLevel) {
    toast('Selecciona nivel y grado', true);
    return;
  }
  if (!sectionValue) {
    toast('Completa la sección académica', true);
    return;
  }
  if (!area) {
    toast('Selecciona el área curricular', true);
    return;
  }
  if (!materia || materia === 'General') {
    toast('Selecciona la asignatura del grado', true);
    return;
  }

  // Validación de perfil (si el docente tiene niveles restringidos)
  if (allowedSections.length && !allowedSections.some(level => normTxt(level) === normTxt(educationLevel))) {
    toast(`Este grado no coincide con los niveles activos de tu perfil (${allowedSections.join(', ')}).`, true);
    return;
  }

  // Verificar duplicados
  const exists = (S.grades || []).some(g => 
    normTxt(g.name) === normTxt(name) && 
    normTxt(normalizeEducationLevelName(g.educationLevel)) === normTxt(educationLevel)
  );
  if (exists) {
    toast('Ese grado ya existe en ese nivel', true);
    return;
  }

  // 2. Creación de Objetos (Local)
  const grade = {
    id: uid(),
    name,
    gradeLevel: parseGradeLevel(name),
    educationLevel,
    subjectName: materia, // Legado compat
    sections: [],
  };

  const section = {
    id: uid(),
    gradeId: grade.id,
    grado: grade.name,
    gradeLevel: grade.gradeLevel,
    sec: sectionLetter,
    sectionLetter,
    materia,
    area,
    room,
  };

  // 3. Actualización del Estado Global
  if (!Array.isArray(S.grades)) S.grades = [];
  if (!Array.isArray(S.secciones)) S.secciones = [];
  
  S.grades.push(grade);
  S.secciones.push(section);

  // Estructura interna del grado (redundancia legacy)
  grade.sections.push({
    id: section.id,
    name: section.sec,
    sectionLetter,
    materia: section.materia,
    area: section.area,
    room: section.room || '',
  });

  // 4. Inicialización Académica (Periodos y Buckets)
  if (typeof ensurePeriodsAndYear === 'function') ensurePeriodsAndYear();
  
  const periods = S.periods || DEFAULT_PERIODS;
  if (!S.periodGroupConfigs) S.periodGroupConfigs = {};
  
  periods.forEach(p => {
    ensurePeriodBuckets(p.id);
    if (!S.periodGroupConfigs[p.id]) S.periodGroupConfigs[p.id] = {};
    S.periodGroupConfigs[p.id][section.id] = emptyGroupCfg();
  });

  // 5. Establecer Contexto Activo
  S.activeGradeId = grade.id;
  S.activeGroupId = section.id;
  S.activeCourseId = section.id;
  SECTION_STUDENT_PANEL_OPEN[section.id] = true;
  markRecentCreatedSection(section.id);

  // 6. Sincronización SQL (Asíncrona pero manejada)
  try {
    const sqlResult = await syncSqlGradeCreateOrUpdate(grade, section);
    // Nota: El motor legado manejaba re-escritura de IDs aquí. 
    // Para simplificar la migración inicial, confiamos en los IDs generados localmente 
    // a menos que el servidor devuelva algo distinto que requiera mapeo profundo.
    if (sqlResult?.grade?.id && sqlResult.grade.id !== grade.id) {
       console.info('[EduGest][sync] ID de grado mapeado por servidor:', sqlResult.grade.id);
       // Podríamos realizar migración de refs aquí si fuera necesario
    }
  } catch (err) {
    console.warn('[EduGest][sync] Error en sincronización SQL inicial:', err);
  }

  // 7. Persistencia y Navegación
  console.info('[EduGest][saveGrade] State updated. Grades count:', S.grades.length);
  persist({ immediate: true });
  
  if (typeof closeM === 'function') closeM('m-grade');
  go('estudiantes');
  toast('Grado creado con su configuración académica inicial');
}
