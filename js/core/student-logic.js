/**
 * Lógica de Gestión de Estudiantes (EduGest Student Logic).
 * --------------------------------------------------------------------------
 * Este módulo centraliza las operaciones CRUD para estudiantes, incluyendo
 * el registro manual, carga masiva, edición y visualización detallada.
 * Gestiona la sincronización con SQL y la persistencia local.
 */

import { S } from './state.js';
import { 
  v, toast, persist, uid, go, openM, closeM, forceCloseM, resetForm, fillSel,
  formatMatricula, isValidMatricula, normalizeMatricula, buildStudentAvatarDataUrl,
  sortCourses, getScopedSections, normTxt, escapeHtml
} from './domain-utils.js';
import { syncSqlStudentCreateOrUpdate } from './sync-logic.js';
import { ensurePeriodBuckets, getGroupLabel } from './academic-context-logic.js';
import { studentFinal } from './math-utils.js';

// --- Estado de Carga Masiva ---
export const BULK_IMPORT_STATE = {
  mode: 'text',
  analyzed: false,
  entries: [],
  sourceName: '',
  lastRows: 0,
};

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
export function openEstM(secId) {
  const targetSecId = secId || S.activeGroupId;
  const sections = sortCourses(getScopedSections());
  
  if (sections.length === 0) {
    toast('Crea una sección antes de registrar estudiantes', true);
    return;
  }

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
  const nom = v('e-nom'), ape = v('e-ape');
  const matOrig = v('e-mat');
  const mat = formatMatricula(matOrig);
  
  const matInput = document.getElementById('e-mat');
  if (matInput) matInput.value = mat;

  if (!nom || !ape) { toast('Nombre y apellido requeridos', true); return; }
  if (!mat) { toast('Matrícula requerida', true); return; }
  if (!isValidMatricula(mat)) { toast('Formato de matrícula inválido (00-0000-0)', true); return; }
  
  if (matriculaExists(mat)) { toast('La matrícula ya está registrada', true); return; }

  const selectedSecId = document.getElementById('e-sec')?.value;
  if (!selectedSecId) { toast('Selecciona una sección', true); return; }

  const sec = S.secciones.find(s => s.id === selectedSecId);
  const photoUrl = String(document.getElementById('e-photo-data')?.value || '').trim();

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
    const nameInput = document.getElementById('e-nom');
    if (nameInput) nameInput.focus();
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
export function openViewStudent(stId) {
  const st = S.estudiantes.find(e => e.id === stId);
  if (!st) return;

  const secId = st.courseId || st.sectionId || st.seccionId || '';
  const sec = S.secciones.find(s => s.id === secId);
  const grade = S.grades.find(g => g.id === (sec?.gradeId || st.gradeId));
  const fullName = `${st.nombre} ${st.apellido}`;

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  
  setText('sv-name', fullName);
  setText('sv-hero-name', fullName);
  setText('sv-mat', st.matricula || '?');
  setText('sv-grade', grade?.name || '?');
  setText('sv-section', sec?.sec || '?');
  setText('sv-subject', sec?.materia || 'General');

  const photoEl = document.getElementById('sv-photo');
  if (photoEl) photoEl.src = st.photoUrl || buildStudentAvatarDataUrl(fullName);

  const idHidden = document.getElementById('sv-id');
  if (idHidden) idHidden.value = st.id;

  openM('m-est-view');
}

/**
 * Abre el modal para editar un estudiante.
 */
export function openEditStudent(stId) {
  const st = S.estudiantes.find(e => e.id === stId);
  if (!st) return;

  const sections = sortCourses(getScopedSections());
  fillSel('ee-sec', sections, s => s.id, s => `${s.grado} ${s.sec} · ${s.materia}`, st.courseId || st.sectionId || st.seccionId);

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setVal('ee-id', st.id);
  setVal('ee-nom', st.nombre);
  setVal('ee-ape', st.apellido);
  setVal('ee-mat', formatMatricula(st.matricula));
  setVal('ee-photo-data', st.photoUrl || '');

  const preview = document.getElementById('ee-photo-preview');
  if (preview) preview.src = st.photoUrl || buildStudentAvatarDataUrl(`${st.nombre} ${st.apellido}`);

  openM('m-est-edit');
}

/**
 * Guarda los cambios realizados a un estudiante.
 */
export async function saveEditStudent() {
  const id = v('ee-id');
  const st = S.estudiantes.find(e => e.id === id);
  if (!st) return;

  const nom = v('ee-nom'), ape = v('ee-ape');
  const mat = formatMatricula(v('ee-mat'));

  if (!nom || !ape || !mat) { toast('Completa todos los campos', true); return; }
  if (matriculaExists(mat, id)) { toast('La matrícula ya está en uso', true); return; }

  const secId = document.getElementById('ee-sec')?.value;
  const sec = S.secciones.find(s => s.id === secId);

  st.nombre = nom;
  st.apellido = ape;
  st.matricula = mat;
  st.photoUrl = v('ee-photo-data');
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
  const key = normalizeMatricula(mat);
  return S.estudiantes.some(s => s.id !== excludeId && normalizeMatricula(s.matricula) === key);
}

/**
 * Actualiza la entrada del directorio local con los datos del estudiante.
 */
export function upsertStudentDirectoryEntry(student, sectionId = '') {
  if (!student) return;
  if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
  
  const entry = {
    nombre: String(student.nombre || '').trim(),
    apellido: String(student.apellido || '').trim(),
    matricula: formatMatricula(student.matricula || ''),
    photoUrl: String(student.photoUrl || '').trim(),
    lastSectionId: sectionId || student.sectionId || student.courseId || '',
    updatedAt: Date.now(),
  };

  const key = `${normTxt(entry.nombre)}|${normTxt(entry.apellido)}|${normalizeMatricula(entry.matricula)}`;
  const idx = S.studentDirectory.findIndex(e => `${normTxt(e.nombre)}|${normTxt(e.apellido)}|${normalizeMatricula(e.matricula)}` === key);

  if (idx >= 0) S.studentDirectory[idx] = { ...S.studentDirectory[idx], ...entry };
  else S.studentDirectory.push(entry);
}

// --- Soporte Carga Masiva ---

/**
 * Abre el modal de carga masiva de estudiantes.
 */
export function openBulkEstM(secId) {
  const sections = sortCourses(getScopedSections());
  if (sections.length === 0) {
    toast('Crea una sección antes de la carga masiva', true);
    return;
  }

  fillSel('be-sec', sections, s => s.id, s => `${s.grado} ${s.sec} · ${s.materia}`, secId || S.activeGroupId || sections[0].id);
  
  const ta = document.getElementById('be-list');
  if (ta) ta.value = '';
  
  BULK_IMPORT_STATE.analyzed = false;
  BULK_IMPORT_STATE.entries = [];
  
  openM('m-est-bulk');
}

/**
 * Procesa el cambio de archivo en la carga masiva.
 */
export function handleBulkFileChange(input) {
  const file = input?.files?.[0];
  if (!file) return;
  BULK_IMPORT_STATE.mode = 'file';
  BULK_IMPORT_STATE.sourceName = file.name;
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

  BULK_IMPORT_STATE.entries = entries;
  BULK_IMPORT_STATE.analyzed = true;
  BULK_IMPORT_STATE.lastRows = entries.length;
  
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
