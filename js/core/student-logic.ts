/**
 * Lógica de Gestión de Estudiantes (EduGest Student Logic).
 * --------------------------------------------------------------------------
 * Este módulo centraliza las operaciones CRUD para estudiantes, incluyendo
 * el registro manual, carga masiva, edición y visualización detallada.
 * Gestiona la sincronización con SQL y la persistencia local.
 */

import { S } from './state.ts';
import { 
  toast, persist, uid, go, openM, closeM, forceCloseM, resetForm, fillSel,
  formatMatricula, isValidMatricula,
  sortCourses, getScopedSections, escapeHtml
} from './domain-utils.ts';
import { syncSqlStudentCreateOrUpdate } from './sync-logic.ts';
import { ensurePeriodBuckets, getGroupLabel } from './academic-context-logic.ts';
import { studentFinal } from './math-utils.ts';
import { ensureModalLoaded } from './modal-loader.ts';
import {
  BULK_IMPORT_STATE,
  setBulkFile,
  setBulkStudentsState,
} from '../../apps/web/src/panels/estudiantes/utils/student-bulk-state.ts';
import {
  buildStudentDirectoryEntry,
  findStudentById,
  studentMatriculaExists,
  upsertStudentDirectoryEntryInList,
} from '../../apps/web/src/panels/estudiantes/utils/student-helpers.ts';
import {
  focusStudentCreateName,
  readStudentCreateFields,
  readStudentEditFields,
  writeStudentCreateMatricula,
  writeStudentEditFields,
  writeStudentViewFields,
} from '../../apps/web/src/panels/estudiantes/utils/student-dom-fields.ts';

/**
 * Abre el modal para elegir cómo agregar estudiantes.
 */
export function openStudentAddModeModal() {
  openM('m-student-add-mode');
}

/**
 * Gestiona la elección del modo de registro de estudiantes.
 * @param {string} mode - 'bulk' o 'manual'.
 */
export function chooseStudentAddMode(mode) {
  forceCloseM('m-student-add-mode');
  const targetSecId = S.activeGroupId || S.activeCourseId || '';
  if (mode === 'bulk') {
    openBulkEstM(targetSecId);
    return;
  }
  openEstM(targetSecId);
}

/**
 * Abre el modal de registro manual de estudiante.
 * @param {string} [secId] - ID de sección sugerido.
 */
export async function openEstM(secId) {
  const targetSecId = secId || S.activeGroupId;
  const sections = sortCourses(getScopedSections());
  
  if (sections.length === 0) {
    toast('Crea una sección antes de registrar estudiantes', true);
    return;
  }

  await ensureModalLoaded('m-est');
  fillSel('e-sec', sections, s => s.id, s => `${s.grado} ${s.sec} · ${s.materia}`, targetSecId || sections[0].id);
  
  // Limpiar campos si es necesario
  resetForm('student', { courseId: targetSecId || sections[0].id });
  
  openM('m-est', { courseId: targetSecId || sections[0].id });
}

/**
 * Guarda un nuevo estudiante en el sistema.
 * @param {Object} [options] - Configuración adicional (ej. keepOpen).
 */
export async function saveEst(options = {}) {
  const keepOpen = options?.keepOpen === true;
  const createFields = readStudentCreateFields();
  const nom = createFields.nombre;
  const ape = createFields.apellido;
  const mat = formatMatricula(createFields.matriculaOriginal);
  writeStudentCreateMatricula(mat);

  if (!nom || !ape) { toast('Nombre y apellido requeridos', true); return; }
  if (!mat) { toast('Matrícula requerida', true); return; }
  if (!isValidMatricula(mat)) { toast('Formato de matrícula inválido (00-0000-0)', true); return; }
  
  if (matriculaExists(mat)) { toast('La matrícula ya está registrada', true); return; }

  const selectedSecId = createFields.selectedSectionId;
  if (!selectedSecId) { toast('Selecciona una sección', true); return; }

  const sec = S.secciones.find(s => s.id === selectedSecId);
  const photoUrl = createFields.photoUrl;

  const student = {
    id: uid(),
    nombre: nom,
    apellido: ape,
    matricula: mat,
    photoUrl,
    courseId: selectedSecId,
    sectionId: selectedSecId,
    seccionId: selectedSecId,
    gradeId: sec?.gradeId || null
  };

  S.estudiantes.push(student);
  upsertStudentDirectoryEntry(student, selectedSecId);

  try {
    const sqlStudent = await syncSqlStudentCreateOrUpdate(student);
    if (sqlStudent?.id) student.id = sqlStudent.id;
  } catch (error) {
    console.warn('[EduGest][student] Fallo sync SQL:', error);
  }

  persist();

  if (keepOpen) {
    resetForm('student', { courseId: selectedSecId });
    focusStudentCreateName();
    toast('Estudiante registrado. Puedes agregar otro.');
    return;
  }

  // Notificar éxito y cerrar contexto de edición
  closeM('m-est');
  go('estudiantes');
  toast('Estudiante registrado');
}

/**
 * Abre la vista detallada de un estudiante.
 */
export async function openViewStudent(stId) {
  const st = findStudentById(S.estudiantes, stId);
  if (!st) return;

  await ensureModalLoaded('m-est-view');

  const secId = st.courseId || st.sectionId || st.seccionId || '';
  const sec = S.secciones.find(s => s.id === secId);
  const grade = S.grades.find(g => g.id === (sec?.gradeId || st.gradeId));
  const fullName = `${st.nombre} ${st.apellido}`;

  writeStudentViewFields(st, {
    fullName,
    gradeName: grade?.name || '?',
    sectionName: sec?.sec || '?',
    subjectName: sec?.materia || 'General',
  });

  openM('m-est-view');
}

/**
 * Abre el modal para editar un estudiante.
 */
export async function openEditStudent(stId) {
  const st = findStudentById(S.estudiantes, stId);
  if (!st) return;

  await ensureModalLoaded('m-est-edit');
  const sections = sortCourses(getScopedSections());
  fillSel('ee-sec', sections, s => s.id, s => `${s.grado} ${s.sec} · ${s.materia}`, st.courseId || st.sectionId || st.seccionId);

  writeStudentEditFields(st);

  openM('m-est-edit');
}

/**
 * Guarda los cambios realizados a un estudiante.
 */
export async function saveEditStudent() {
  const editFields = readStudentEditFields();
  const id = editFields.id;
  const st = findStudentById(S.estudiantes, id);
  if (!st) return;

  const nom = editFields.nombre;
  const ape = editFields.apellido;
  const mat = formatMatricula(editFields.matriculaOriginal);

  if (!nom || !ape || !mat) { toast('Completa todos los campos', true); return; }
  if (matriculaExists(mat, id)) { toast('La matrícula ya está en uso', true); return; }

  const secId = editFields.selectedSectionId;
  const sec = S.secciones.find(s => s.id === secId);

  st.nombre = nom;
  st.apellido = ape;
  st.matricula = mat;
  st.photoUrl = editFields.photoUrl;
  st.courseId = secId;
  st.sectionId = secId;
  st.seccionId = secId;
  st.gradeId = sec?.gradeId || null;

  upsertStudentDirectoryEntry(st, secId);

  try {
    await syncSqlStudentCreateOrUpdate(st);
  } catch (error) {
    console.warn('[EduGest][student] Fallo sync SQL edit:', error);
  }

  persist();
  closeM('m-est-edit');
  go('estudiantes');
  toast('Estudiante actualizado');
}

/**
 * Verifica si una matrícula ya existe en el sistema.
 */
function matriculaExists(mat, excludeId = null) {
  return studentMatriculaExists(S.estudiantes, mat, excludeId);
}

/**
 * Actualiza la entrada del directorio local con los datos del estudiante.
 */
export function upsertStudentDirectoryEntry(student, sectionId = '') {
  if (!student) return;
  if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
  upsertStudentDirectoryEntryInList(S.studentDirectory, buildStudentDirectoryEntry(student, sectionId));
}

// --- Soporte Carga Masiva ---

/**
 * Abre el modal de carga masiva de estudiantes.
 */
export async function openBulkEstM(secId) {
  const sections = sortCourses(getScopedSections());
  if (sections.length === 0) {
    toast('Crea una sección antes de la carga masiva', true);
    return;
  }

  await ensureModalLoaded('m-est-bulk');
  fillSel('be-sec', sections, s => s.id, s => `${s.grado} ${s.sec} · ${s.materia}`, secId || S.activeGroupId || sections[0].id);
  
  const ta = document.getElementById('be-list');
  if (ta) ta.value = '';
  
  setBulkStudentsState({ analyzed: false, entries: [] });
  
  openM('m-est-bulk');
}

/**
 * Procesa el cambio de archivo en la carga masiva.
 */
export function handleBulkFileChange(input) {
  const file = input?.files?.[0];
  if (!file) return;
  setBulkFile(file);
  toast(`Archivo seleccionado: ${file.name}`);
}

/**
 * Analiza la entrada de carga masiva (texto o archivo).
 */
export async function analyzeBulkInput() {
  const list = (document.getElementById('be-list')?.value || '').trim();
  if (!list) { toast('Pega la lista de estudiantes', true); return false; }
  
  const lines = list.split(/\r?\n/).filter(l => l.trim());
  const entries = lines.map((line, idx) => {
    // Ejemplo simple de parseo: "Matricula, Nombre, Apellido" o "Matricula Nombre Apellido"
    const parts = line.split(/[,;\t]/).map(s => s.trim());
    if (parts.length < 2) return null;
    
    return {
      row: idx + 1,
      matricula: formatMatricula(parts[0]),
      nombre: parts[1],
      apellido: parts[2] || '',
      status: 'new'
    };
  }).filter(Boolean);

  setBulkStudentsState({ entries, analyzed: true, lastRows: entries.length });
  
  toast(`${entries.length} estudiantes detectados. Listo para cargar.`);
  return true;
}

/**
 * Ejecuta el proceso de guardado masivo.
 */
export async function saveBulkEst() {
  const secId = document.getElementById('be-sec')?.value;
  if (!secId) { toast('Selecciona una sección', true); return; }

  if (!BULK_IMPORT_STATE.analyzed) {
    const ok = await analyzeBulkInput();
    if (!ok) return;
  }

  const sec = S.secciones.find(s => s.id === secId);
  let count = 0;

  for (const e of BULK_IMPORT_STATE.entries) {
    if (matriculaExists(e.matricula)) continue;

    const student = {
      id: uid(),
      nombre: e.nombre,
      apellido: e.apellido,
      matricula: e.matricula,
      courseId: secId,
      sectionId: secId,
      seccionId: secId,
      gradeId: sec?.gradeId || null
    };

    S.estudiantes.push(student);
    try { await syncSqlStudentCreateOrUpdate(student); } catch (_) {}
    count++;
  }

  persist();
  closeM('m-est-bulk');
  go('estudiantes');
  toast(`Carga masiva completada: ${count} estudiantes agregados.`);
}

/**
 * Registra un estudiante de forma programática (utilizado por la IA). 
 * Salta las validaciones de UI y usa valores directos.
 */
export async function registerStudentSilently(nombre, apellido, sectionId = null) {
  if (!nombre || !apellido) return { success: false, message: 'Nombre y apellido requeridos.' };
  
  const targetSecId = sectionId || S.activeGroupId || S.activeCourseId || (S.secciones[0]?.id);
  if (!targetSecId) return { success: false, message: 'No hay secciones disponibles para registrar al estudiante.' };

  const sec = S.secciones.find(s => s.id === targetSecId);
  
  // Generar matrícula ficticia o nula si no se provee (aquí generamos una basada en el tiempo para evitar duplicados rápidos)
  const mat = `AI-${Date.now().toString().slice(-6)}`;

  const student = {
    id: uid(),
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    matricula: mat,
    photoUrl: '',
    courseId: targetSecId,
    sectionId: targetSecId,
    seccionId: targetSecId,
    gradeId: sec?.gradeId || null
  };

  S.estudiantes.push(student);
  upsertStudentDirectoryEntry(student, targetSecId);

  try {
    const sqlStudent = await syncSqlStudentCreateOrUpdate(student);
    if (sqlStudent?.id) student.id = sqlStudent.id;
  } catch (error) {
    console.warn('[EduGest][AI-Student] Fallo sync SQL:', error);
  }

  persist();
  return { success: true, student, message: `Estudiante ${nombre} ${apellido} registrado con éxito en ${sec?.grado || 'el sistema'}.` };
}
