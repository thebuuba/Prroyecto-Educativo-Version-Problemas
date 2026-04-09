/**
 * Lógica de Gestión de Secciones y Asignaturas (EduGest Section Logic).
 * --------------------------------------------------------------------------
 * Este módulo gestiona la creación y edición de secciones (cursos) y materias.
 * Asegura la integridad de la estructura académica en el estado global.
 */

import { S } from './state.js';
import { 
  v, toast, persist, uid, go, openM, closeM, fillSel,
  parseSection, parseGradeLevel, normTxt, getScopedGrades
} from './domain-utils.js';
import { syncSqlSectionCreateOrUpdate } from './sync-logic.js';
import { ensurePeriodBuckets } from './academic-context-logic.js';
import { emptyGroupCfg } from './config.js';

/**
 * Abre el modal para crear una nueva sección o asignatura.
 * @param {string} [gradeId] - ID del grado al que pertenecerá.
 */
export function openSecM(gradeId) {
  const targetGradeId = gradeId || S.activeGradeId;
  const grades = getScopedGrades();

  if (grades.length === 0) {
    toast('Crea un grado antes de agregar secciones', true);
    return;
  }

  fillSel('sec-g', grades, g => g.id, g => g.name, targetGradeId || grades[0].id);
  
  // Limpiar campos del modal
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setVal('sec-s', '');
  setVal('sec-m', '');
  setVal('sec-room', '');
  
  openM('m-sec', { gradeId: targetGradeId || grades[0].id });
}

/**
 * Guarda una nueva sección/asignatura en el sistema.
 */
export async function saveSec() {
  const gradeId = document.getElementById('sec-g')?.value;
  const s = v('sec-s');
  
  if (!gradeId || !s) { toast('Completa grado y sección', true); return; }
  
  const g = S.grades.find(x => x.id === gradeId);
  if (!g) { toast('Grado inválido', true); return; }

  const secLetter = parseSection(s);
  const materia = v('sec-m') || 'General';
  const area = document.getElementById('sec-area')?.value || '';
  const room = v('sec-room');

  if (S.secciones.some(sec => sec.gradeId === gradeId && parseSection(sec.sec) === secLetter && normTxt(sec.materia) === normTxt(materia))) {
    toast('Ya existe esa asignatura en esa sección', true);
    return;
  }

  const section = {
    id: uid(),
    gradeId,
    grado: g.name,
    gradeLevel: g.gradeLevel || parseGradeLevel(g.name),
    sec: secLetter,
    sectionLetter: secLetter,
    materia,
    area,
    room
  };

  S.secciones.push(section);
  
  // Sincronizar con el objeto de grado
  g.sections = g.sections || [];
  g.sections.push({ id: section.id, name: section.sec, materia: section.materia });

  // Inicializar configuraciones de grupos para todos los periodos
  const periods = S.periods || [{ id: 'P1' }, { id: 'P2' }, { id: 'P3' }, { id: 'P4' }];
  periods.forEach(p => {
    ensurePeriodBuckets(p.id);
    if (!S.periodGroupConfigs[p.id]) S.periodGroupConfigs[p.id] = {};
    S.periodGroupConfigs[p.id][section.id] = emptyGroupCfg();
  });

  S.activeGroupId = section.id;
  S.activeGradeId = section.gradeId;

  try {
    const sqlSec = await syncSqlSectionCreateOrUpdate(section);
    if (sqlSec?.id && sqlSec.id !== section.id) {
      const oldId = section.id;
      section.id = sqlSec.id;
      if (S.activeGroupId === oldId) S.activeGroupId = section.id;
      if (S.activeCourseId === oldId) S.activeCourseId = section.id;
      migrateSectionReferences(oldId, section.id);
      
      // Actualizar la lista en el grado
      g.sections = g.sections.map(s => s.id === oldId ? { ...s, id: section.id } : s);
      // Actualizar la lista global
      S.secciones = S.secciones.map(s => s.id === oldId ? section : s);
    }
  } catch (error) {
    console.warn('[EduGest][section] Fallo sync SQL:', error);
  }

  persist();
  closeM('m-sec');
  go('estudiantes');
  toast('Sección/Asignatura creada');
}

/**
 * Migra las referencias de una sección antigua a una nueva (usado durante sync SQL).
 */
export function migrateSectionReferences(oldId, newId) {
  if (!oldId || !newId || oldId === newId) return;

  // Migrar configuraciones de periodo
  Object.keys(S.periodGroupConfigs || {}).forEach((pid) => {
    const periodCfg = S.periodGroupConfigs[pid];
    if (periodCfg && Object.prototype.hasOwnProperty.call(periodCfg, oldId)) {
      periodCfg[newId] = periodCfg[oldId];
      delete periodCfg[oldId];
    }
  });

  // Migrar estudiantes asociados
  (S.estudiantes || []).forEach(st => {
    if (st.courseId === oldId) st.courseId = newId;
    if (st.sectionId === oldId) st.sectionId = newId;
    if (st.seccionId === oldId) st.seccionId = newId;
  });
}

/**
 * Abre el modal para editar una sección.
 */
export function openEditSection(sectionId) {
  const sec = S.secciones.find(s => s.id === sectionId);
  if (!sec) return;

  const grades = getScopedGrades();
  fillSel('es-gid', grades, g => g.id, g => g.name, sec.gradeId);

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setVal('es-id', sec.id);
  setVal('es-sec', sec.sec);
  setVal('es-mat', sec.materia);
  setVal('es-room', sec.room || '');
  setVal('es-area', sec.area || '');

  openM('m-sec-edit');
}

/**
 * Guarda los cambios realizados a una sección.
 */
export async function saveEditSection() {
  const id = v('es-id');
  const sec = S.secciones.find(s => s.id === id);
  if (!sec) return;

  const gradeId = document.getElementById('es-gid')?.value;
  const s = v('es-sec');
  const g = S.grades.find(x => x.id === gradeId);

  if (!gradeId || !s || !g) { toast('Completa todos los campos', true); return; }

  sec.gradeId = gradeId;
  sec.grado = g.name;
  sec.gradeLevel = g.gradeLevel || parseGradeLevel(g.name);
  sec.sec = parseSection(s);
  sec.sectionLetter = sec.sec;
  sec.materia = v('es-mat');
  sec.area = v('es-area');
  sec.room = v('es-room');

  try {
    await syncSqlSectionCreateOrUpdate(sec);
  } catch (error) {
    console.warn('[EduGest][section] Fallo sync SQL edit:', error);
  }

  persist();
  closeM('m-sec-edit');
  go('estudiantes');
  toast('Sección actualizada');
}

/**
 * Abre el modal de asignatura dentro de un grado específico.
 */
export function openSubjectInGrade(gradeId, sectionId) {
  const sec = S.secciones.find(s => s.id === sectionId);
  openSecM(gradeId || sec?.gradeId);
  
  window.setTimeout(() => {
    const secInput = document.getElementById('sec-s');
    if (secInput && sec) secInput.value = sec.sec;
    const areaInput = document.getElementById('sec-area');
    if (areaInput && sec) areaInput.value = sec.area || '';
  }, 100);
}
