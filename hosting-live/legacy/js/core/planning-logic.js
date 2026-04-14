/**
 * Lógica de Planificación Docente (Secuencias Didácticas).
 * --------------------------------------------------------------------------
 * Este módulo gestiona el ciclo de vida de las planificaciones de clase,
 * incluyendo la creación de borradores, normalización de esquemas antiguos,
 * vinculación con el currículo y persistencia de estados de edición.
 */

import { S } from './state.js';
import { uid, normTxt } from './utils.js';
import { persist } from './hydration.js';
import { restoreSpanishQuestionCorruption, curriculumNormalizeSpecificCompetencyText } from './string-utils.js';
import { curriculumNormalizeGradeKey } from './curriculum-logic.js';

/**
 * Obtiene el ID del grupo asociado a una planificación.
 * @param {Object} plan - Objeto de planificación.
 * @returns {string} ID del grupo.
 */
export function lessonPlanStoredGroupId(plan) {
  return plan?.groupId || plan?.general?.groupId || plan?.general?.sectionId || '';
}

/**
 * Obtiene el ID del periodo asociado a una planificación.
 * @param {Object} plan - Objeto de planificación.
 * @returns {string} ID del periodo (ej. P1).
 */
export function lessonPlanStoredPeriodId(plan) {
  return plan?.periodId || plan?.general?.periodId || S.activePeriodId || 'P1';
}

/**
 * Retorna el nombre del docente desde el perfil o sesión.
 * @returns {string}
 */
export function lessonPlanTeacherName() {
  return String(S.profile?.name || S.sessionUserName || '').trim();
}

/**
 * Retorna el nombre de la institución (centro educativo).
 * @returns {string}
 */
export function lessonPlanInstitutionName() {
  return String(S.profile?.inst || '').trim();
}

/**
 * Infiere el área curricular basada en el nombre de la materia del grupo.
 * @param {Object} group - Objeto de grupo/sección.
 * @returns {string} Nombre oficial del área.
 */
export function lessonPlanAreaFromGroup(group) {
  const subject = String(group?.materia || '').toLowerCase();
  if (/(biologia|quimica|fisica|ciencia|naturaleza|tierra|vida)/.test(subject)) return 'Ciencias de la Naturaleza';
  if (/(lengua|literaria|texto|periodistic|publicitario|espanol)/.test(subject)) return 'Lengua Española';
  if (/(matemat|algebra|geometr)/.test(subject)) return 'Matemática';
  if (/(social|historia|geografia|geografía)/.test(subject)) return 'Ciencias Sociales';
  if (/ingles|english|frances|franc[eé]s/.test(subject)) return 'Lenguas Extranjeras';
  return group?.area || '';
}

/**
 * Obtiene la descripción detallada de un eje transversal a partir de su valor.
 * @param {string} value - Valor/ID del eje.
 * @returns {string}
 */
export function lessonPlanTransversalAxisDescription(value) {
  if (typeof window.LESSON_PLAN_TRANSVERSAL_AXES === 'undefined') return '';
  const selected = window.LESSON_PLAN_TRANSVERSAL_AXES.find((item) => item.value === String(value || '').trim());
  return selected?.description || '';
}

/**
 * Devuelve un texto de ejemplo (placeholder) sugerido para una competencia fundamental.
 * @param {string} fundamental - Nombre de la competencia fundamental.
 * @returns {string}
 */
export function lessonPlanSpecificPlaceholderForFundamental(fundamental) {
  const clean = normTxt(restoreSpanishQuestionCorruption(String(fundamental || '').trim()));
  const map = {
    [normTxt('Competencia comunicativa')]: 'Ej. Expresa ideas de forma clara y argumentada durante el trabajo en clase...',
    [normTxt('Competencia de pensamiento lógico, creativo y crítico')]: 'Ej. Analiza situaciones y propone soluciones con razonamiento lógico...',
    [normTxt('Competencia de resolución de problemas')]: 'Ej. Resuelve situaciones del entorno aplicando estrategias pertinentes...',
    [normTxt('Competencia ética y ciudadana')]: 'Ej. Participa de manera responsable y respetuosa en situaciones de convivencia escolar...',
    [normTxt('Competencia científica y tecnológica')]: 'Ej. Interpreta fenómenos utilizando lenguaje científico y recursos tecnológicos...',
    [normTxt('Competencia ambiental y de la salud')]: 'Ej. Promueve acciones de cuidado ambiental y hábitos saludables en su contexto...',
    [normTxt('Competencia de desarrollo personal y espiritual')]: 'Ej. Demuestra autocontrol, empatía y compromiso con su crecimiento personal...',
  };
  return map[clean] || 'Ej. Describe la competencia específica que desarrollarás en esta clase...';
}

/**
 * Crea la estructura inicial de datos generales para una planificación nueva.
 * @param {string} [groupId=S.activeGroupId] - Grupo activo.
 * @param {string} [periodId=S.activePeriodId] - Periodo activo.
 * @returns {Object} Datos generales.
 */
export function lessonPlanCreateGeneral(groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const group = (S.secciones || []).find((item) => item.id === groupId) || null;
  const grade = (S.grades || []).find((item) => item.id === group?.gradeId) || null;
  
  return {
    center: lessonPlanInstitutionName(),
    teacher: lessonPlanTeacherName(),
    area: lessonPlanAreaFromGroup(group),
    subject: group?.materia || '',
    subarea: group?.materia || '',
    usesTemporaryGrade: false,
    gradeId: group?.gradeId || '',
    gradeName: lessonPlanFullGradeName(group, grade),
    sectionId: groupId || '',
    sectionName: group?.sec || '',
    groupId: groupId || '',
    periodId: periodId || S.activePeriodId || 'P1',
    themeTitle: '',
    sequenceName: '',
    title: '',
    transversalAxis: '',
    classDate: '',
    scheduleLinked: false,
    totalDuration: '',
    classCount: 1,
    startDate: '',
    endDate: '',
  };
}

/**
 * Genera una estructura de planificación vacía con valores por defecto.
 * @param {string} [groupId=S.activeGroupId] - Grupo inicial.
 * @param {string} [periodId=S.activePeriodId] - Periodo inicial.
 * @returns {Object} Nueva planificación con esquema V2.
 */
export function lessonPlanCreateBlank(groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const now = Date.now();
  return {
    id: uid(),
    version: 2,
    status: 'draft',
    editorStep: 'general',
    groupId: groupId || '',
    periodId: periodId || S.activePeriodId || 'P1',
    createdAt: now,
    updatedAt: now,
    general: lessonPlanCreateGeneral(groupId, periodId),
    curriculum: {
      fundamentalCompetencies: '',
      specificCompetencies: '',
      specificCompetencyMap: {},
      specificCompetencyModeMap: {},
      conceptualMeta: { topic: '', subtopics: [], notesByTopic: {} },
      conceptualContents: '',
      proceduralMeta: { topic: '', subtopics: [], itemIds: [], manualReviewRequired: false },
      proceduralItemMap: {},
      proceduralContents: '',
      attitudinalMeta: { topic: '', subtopics: [], itemIds: [], manualReviewRequired: false },
      attitudinalItemMap: {},
      attitudinalContents: '',
      indicatorMeta: { topic: '', subtopics: [], itemIds: [], manualReviewRequired: false },
      indicatorItemMap: {},
      indicators: '',
    },
    strategy: { teachingLearning: '', methodology: '', organization: '', inclusionNotes: '' },
    resources: { preset: [], notes: '' },
    classes: [lessonPlanCreateClass(1)],
    exportMeta: { template: 'structured', futureAiReady: true, curriculumSource: 'manual' },
  };
}

/**
 * Normaliza un objeto de vinculación de actividad para asegurar tipos de datos consistentes.
 */
export function lessonPlanNormalizeActivityLink(link) {
  const base = link && typeof link === 'object' ? link : {};
  return {
    activityId: String(base.activityId || '').trim(),
    blockId: (S.BLOCKS || ['B1', 'B2', 'B3', 'B4']).includes(base.blockId) ? base.blockId : 'B1',
    instrumentId: String(base.instrumentId || '').trim(),
    evidence: String(base.evidence || '').trim(),
    technique: String(base.technique || '').trim(),
  };
}

/**
 * Normaliza los datos de una clase individual dentro de una planificación.
 * @param {Object} rawClass - Datos crudos de la clase.
 * @param {number} [index=1] - Índice de la clase en la secuencia.
 * @returns {Object} Clase normalizada.
 */
export function lessonPlanNormalizeClass(rawClass, index = 1) {
  const base = rawClass && typeof rawClass === 'object' ? rawClass : {};
  const durationHours = String(base.durationHours || '').trim() || '1';
  return lessonPlanCreateClass(index, {
    ...base,
    id: base.id || uid(),
    index,
    title: String(base.title || base.topic || '').trim(),
    date: String(base.date || '').trim(),
    durationHours,
    durationMinutes: String(base.durationMinutes || base.duration || (durationHours + 'h')).trim(),
    pedagogicalIntent: String(base.pedagogicalIntent || base.intent || '').trim(),
    notes: String(base.notes || '').trim(),
    resourcesPreset: Array.isArray(base.resourcesPreset) ? base.resourcesPreset.map((item) => String(item || '').trim()).filter(Boolean) : [],
    resourcesText: String(base.resourcesText || '').trim(),
    activityLinks: Array.isArray(base.activityLinks) ? base.activityLinks.map(lessonPlanNormalizeActivityLink).filter((item) => item.activityId) : [],
    start: base.start || {},
    development: base.development || {},
    closure: base.closure || {},
    adaptation: base.adaptation || {},
  });
}

/**
 * Convierte planificaciones antiguas (V1/Legacy) al formato modular moderno (V2).
 * Realiza limpieza de campos, mapeo de IDs y asegura integridad referencial.
 * @param {Object} plan - Planificación a normalizar.
 * @returns {Object} Planificación compatible con el editor modular.
 */
export function lessonPlanNormalizePlan(plan) {
  const base = plan && typeof plan === 'object' ? plan : {};
  
  // Detección y migración de formato heredado (monolítico)
  if (!base.general && (base.title || base.date || base.contents || base.activities)) {
    const legacy = lessonPlanCreateBlank(base.groupId || '', base.periodId || S.activePeriodId || 'P1');
    legacy.id = base.id || legacy.id;
    legacy.createdAt = Number.isFinite(base.createdAt) ? base.createdAt : legacy.createdAt;
    legacy.updatedAt = Number.isFinite(base.updatedAt) ? base.updatedAt : legacy.updatedAt;
    legacy.general.title = String(base.title || '').trim();
    legacy.general.startDate = String(base.date || '').trim();
    legacy.general.endDate = String(base.date || '').trim();
    legacy.resources.notes = String(base.resources || '').trim();
    legacy.curriculum.conceptualContents = String(base.contents || '').trim();
    legacy.curriculum.indicators = String(base.evidences || '').trim();
    legacy.strategy.teachingLearning = String(base.purpose || '').trim();
    legacy.classes = [lessonPlanCreateClass(1, {
      date: String(base.date || '').trim(),
      title: String(base.title || '').trim(),
      development: {
        description: String(base.activities || '').trim(),
        activities: String(base.activities || '').trim(),
      },
      closure: { conclusions: String(base.notes || '').trim() },
      resourcesText: String(base.resources || '').trim(),
      notes: String(base.notes || '').trim(),
    })];
    return legacy;
  }
  
  const normalized = lessonPlanCreateBlank(lessonPlanStoredGroupId(base), lessonPlanStoredPeriodId(base));
  normalized.id = base.id || normalized.id;
  normalized.status = base.status === 'completed' ? 'completed' : 'draft';
  normalized.editorStep = base.editorStep || 'general';
  normalized.groupId = lessonPlanStoredGroupId(base);
  normalized.periodId = lessonPlanStoredPeriodId(base);
  normalized.createdAt = Number.isFinite(base.createdAt) ? base.createdAt : normalized.createdAt;
  normalized.updatedAt = Number.isFinite(base.updatedAt) ? base.updatedAt : normalized.updatedAt;
  normalized.general = { ...normalized.general, ...(base.general || {}) };
  normalized.general.groupId = normalized.groupId;
  normalized.general.sectionId = normalized.general.sectionId || normalized.groupId;
  normalized.general.periodId = normalized.periodId;
  normalized.general.usesTemporaryGrade = !!normalized.general.usesTemporaryGrade;
  normalized.general.themeTitle = String(normalized.general.themeTitle || normalized.general.title || '').trim();
  normalized.general.title = String(normalized.general.title || normalized.general.themeTitle || '').trim();
  normalized.general.startDate = String(normalized.general.startDate || normalized.general.classDate || '').trim();
  normalized.general.endDate = String(normalized.general.endDate || normalized.general.classDate || '').trim();
  normalized.curriculum = { ...normalized.curriculum, ...(base.curriculum || {}) };
  
  if (!normalized.curriculum.specificCompetencyMap || typeof normalized.curriculum.specificCompetencyMap !== 'object') {
    normalized.curriculum.specificCompetencyMap = {};
  }
  if (!normalized.curriculum.specificCompetencyModeMap || typeof normalized.curriculum.specificCompetencyModeMap !== 'object') {
    normalized.curriculum.specificCompetencyModeMap = {};
  }
  
  normalized.strategy = { ...normalized.strategy, ...(base.strategy || {}) };
  normalized.resources = {
    preset: Array.isArray(base.resources?.preset) ? base.resources.preset.map((item) => String(item || '').trim()).filter(Boolean) : [],
    notes: String(base.resources?.notes || '').trim(),
  };
  normalized.classes = (Array.isArray(base.classes) ? base.classes : []).map((item, idx) => lessonPlanNormalizeClass(item, idx + 1));
  if (!normalized.classes.length) normalized.classes = [lessonPlanCreateClass(1)];
  normalized.exportMeta = { ...normalized.exportMeta, ...(base.exportMeta || {}) };
  
  return normalized;
}

/**
 * Determina si una planificación contiene suficiente información para ser conservada.
 */
export function lessonPlanShouldKeep(plan) {
  if (lessonPlanStoredGroupId(plan)) return true;
  const general = plan?.general || {};
  return !!(
    general.usesTemporaryGrade
    || String(general.gradeName || '').trim()
    || String(general.sectionName || '').trim()
    || String(general.subject || '').trim()
    || String(general.themeTitle || general.title || '').trim()
    || String(general.sequenceName || '').trim()
  );
}

/**
 * Asegura que el estado global de planificaciones esté inicializado y normalizado.
 * Gestiona el borrador actual (Draft) y los parámetros de visualización.
 */
export function ensureLessonPlansState() {
  if (!Array.isArray(S.lessonPlans)) S.lessonPlans = [];
  S.lessonPlans = S.lessonPlans.map((plan) => lessonPlanNormalizePlan(plan)).filter((plan) => lessonPlanShouldKeep(plan));
  
  if (!S.lessonPlanDraft || typeof S.lessonPlanDraft !== 'object') {
    S.lessonPlanDraft = lessonPlanCreateBlank(S.activeGroupId, S.activePeriodId);
  } else {
    S.lessonPlanDraft = lessonPlanNormalizePlan(S.lessonPlanDraft);
  }
  
  if (!S.lessonPlanUi || typeof S.lessonPlanUi !== 'object') S.lessonPlanUi = {};
  if (!Array.isArray(S.lessonPlanUi.expandedClassIds)) {
    S.lessonPlanUi.expandedClassIds = (S.lessonPlanDraft.classes || []).map((lessonClass) => lessonClass.id);
  }
  if (!S.lessonPlanUi.activityDrafts || typeof S.lessonPlanUi.activityDrafts !== 'object') {
    S.lessonPlanUi.activityDrafts = {};
  }
  
  if (typeof S.lessonPlanUi.activeSectionId !== 'string') S.lessonPlanUi.activeSectionId = '';
  if (typeof S.lessonPlanUi.mode !== 'string') S.lessonPlanUi.mode = 'home';
  if (typeof S.lessonPlanUi.autosaveTimer !== 'number') S.lessonPlanUi.autosaveTimer = 0;
}

/**
 * Filtra y ordena las planificaciones pertenecientes a un grupo y periodo específicos.
 * @param {string} [groupId=S.activeGroupId] - ID del grupo.
 * @returns {Array} Planificaciones ordenadas por fecha reciente.
 */
export function lessonPlansForGroup(groupId = S.activeGroupId) {
  ensureLessonPlansState();
  return (S.lessonPlans || [])
    .filter((plan) => lessonPlanStoredGroupId(plan) === groupId && (!lessonPlanStoredPeriodId(plan) || lessonPlanStoredPeriodId(plan) === S.activePeriodId))
    .sort((a, b) => String(b.general?.classDate || b.general?.startDate || '').localeCompare(String(a.general?.classDate || a.general?.startDate || ''), 'es') || (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}

/**
 * Obtiene la lista de borradores pendientes (no completados).
 * @returns {Array} Borradores ordenados por fecha de actualización.
 */
export function lessonPlanDrafts() {
  ensureLessonPlansState();
  return (S.lessonPlans || [])
    .filter((plan) => (plan.status || 'draft') !== 'completed')
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}

/**
 * Formatea una marca de tiempo en una etiqueta de tiempo relativo (ej. "Hace 5 min").
 * @param {number|string} value - Timestamp.
 * @returns {string} Etiqueta en español.
 */
export function lessonPlanRelativeUpdatedAt(value) {
  const ts = Number(value || 0);
  if (!ts) return 'Hace un momento';
  const delta = Math.max(0, Date.now() - ts);
  const minute = 60000;
  const hour = minute * 60;
  const day = hour * 24;
  if (delta < minute) return 'Hace unos segundos';
  if (delta < hour) {
    const minutes = Math.max(1, Math.round(delta / minute));
    return `Hace ${minutes} min`;
  }
  if (delta < day) {
    const hours = Math.max(1, Math.round(delta / hour));
    return `Hace ${hours} hora${hours === 1 ? '' : 's'}`;
  }
  const days = Math.max(1, Math.round(delta / day));
  return `Hace ${days} día${days === 1 ? '' : 's'}`;
}

/**
 * Retorna el nombre legible de un bloque académico.
 * @param {string} blockId - ID del bloque (B1-B4).
 * @returns {string}
 */
export function lessonPlanBlockLabel(blockId) {
  const labels = { B1: 'Bloque 1', B2: 'Bloque 2', B3: 'Bloque 3', B4: 'Bloque 4' };
  return labels[blockId] || 'Bloque';
}

/**
 * Obtiene el borrador activo actual.
 * @returns {Object}
 */
export function lessonPlanDraft() {
  ensureLessonPlansState();
  return S.lessonPlanDraft;
}

/**
 * Persiste el borrador actual en la lista global de planes y dispara el guardado en DB.
 * Cancela cualquier temporizador de autoguardado pendiente.
 * @param {string} [statusOverride='draft'] - Forzar un estado (ej. 'completed').
 */
export function lessonPlanPersistDraftNow(statusOverride = 'draft') {
  if (S.lessonPlanUi?.autosaveTimer) {
    clearTimeout(S.lessonPlanUi.autosaveTimer);
    S.lessonPlanUi.autosaveTimer = 0;
  }
  
  ensureLessonPlansState();
  const draft = lessonPlanNormalizePlan(S.lessonPlanDraft);
  draft.status = statusOverride || draft.status || 'draft';
  draft.updatedAt = Date.now();
  
  const idx = (S.lessonPlans || []).findIndex((item) => item.id === draft.id);
  if (idx >= 0) S.lessonPlans[idx] = draft;
  else S.lessonPlans.unshift(draft);
  
  S.lessonPlanDraft = lessonPlanNormalizePlan(draft);
  persist({ immediate: true });
}

/**
 * Obtiene el nombre completo del grado (Grado + Nivel).
 */
export function lessonPlanFullGradeName(group, grade) {
  if (grade?.name) return grade.name;
  if (group?.grado) return group.grado;
  return '';
}

/**
 * Lista los grados disponibles para selección manual en la planificación.
 */
export function lessonPlanAvailableGrades() {
  return (S.grades || []).map(g => ({ id: g.id, name: g.name }));
}

/**
 * Obtiene las letras de secciones asociadas a un grado específico.
 */
export function lessonPlanSectionOptionsForGradeId(gradeId) {
  if (!gradeId) return [];
  return (S.secciones || [])
    .filter(s => s.gradeId === gradeId)
    .map(s => ({ value: s.sec, label: s.sec }));
}

/**
 * Lista las asignaturas vinculadas a las secciones de un grado.
 */
export function lessonPlanSubjectOptionsForGradeId(gradeId) {
  if (!gradeId) return [];
  const subjects = new Set();
  (S.secciones || [])
    .filter(s => s.gradeId === gradeId)
    .forEach(s => { if (s.materia) subjects.add(s.materia); });
  return Array.from(subjects).map(s => ({ value: s, label: s }));
}

/**
 * Retorna las opciones oficiales de Áreas Curriculares del sistema educativo.
 */
export function lessonPlanAreaOptions() {
  return [
    { value: 'Lengua Española', label: 'Lengua Española' },
    { value: 'Matemática', label: 'Matemática' },
    { value: 'Ciencias de la Naturaleza', label: 'Ciencias de la Naturaleza' },
    { value: 'Ciencias Sociales', label: 'Ciencias Sociales' },
    { value: 'Lenguas Extranjeras', label: 'Lenguas Extranjeras' },
    { value: 'Educación Física', label: 'Educación Física' },
    { value: 'Educación Artística', label: 'Educación Artística' },
    { value: 'Formación Integral Humana y Religiosa', label: 'Formación Integral Humana y Religiosa' },
  ];
}

/**
 * Retorna la fecha de hoy en formato ISO (YYYY-MM-DD).
 */
export function lessonPlanTodayIso() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

/**
 * Sugiere la fecha para la siguiente clase, saltando fines de semana.
 * @param {string} [prevDate=''] - Fecha base opcional.
 * @returns {string} Fecha sugerida.
 */
export function lessonPlanSuggestedNextClassDate(prevDate = '') {
  const base = prevDate ? new Date(prevDate) : new Date();
  if (isNaN(base.getTime())) return lessonPlanTodayIso();
  base.setDate(base.getDate() + 1);
  if (base.getDay() === 0) base.setDate(base.getDate() + 1);
  if (base.getDay() === 6) base.setDate(base.getDate() + 2);
  return base.toISOString().split('T')[0];
}

/**
 * Resuelve un objeto de grupo buscando por Grado y Sección.
 */
export function lessonPlanResolveGroupForSelection(gradeId, sectionName) {
  return (S.secciones || []).find(s => s.gradeId === gradeId && s.sec === sectionName) || null;
}

/**
 * Aplica una selección de datos generales al borrador actual.
 * Actualiza IDs vinculados de grupo y periodo.
 * @param {Object} draft - Borrador actual.
 * @param {Object} selection - Atributos seleccionados por el usuario.
 * @returns {Object} Borrador actualizado.
 */
export function lessonPlanApplyGeneralSelection(draft, selection) {
  const { gradeId, gradeName, sectionName, subject, periodId } = selection;
  const group = lessonPlanResolveGroupForSelection(gradeId, sectionName);
  
  draft.groupId = group?.id || '';
  draft.periodId = periodId || draft.periodId || 'P1';
  
  if (!draft.general) draft.general = lessonPlanCreateGeneral(draft.groupId, draft.periodId);
  draft.general.gradeId = gradeId;
  draft.general.gradeName = gradeName;
  draft.general.sectionId = draft.groupId;
  draft.general.sectionName = sectionName;
  draft.general.subject = subject;
  draft.general.groupId = draft.groupId;
  draft.general.periodId = draft.periodId;
  
  return draft;
}

/**
 * Crea la estructura de datos para una clase individual de la secuencia didáctica.
 * Inicializa los momentos de la clase (Inicio, Desarrollo, Cierre) con sus duraciones sugeridas.
 * @param {number} index - Índice de la clase.
 * @param {Object} [base={}] - Valores base opcionales.
 * @returns {Object} Estructura de clase.
 */
export function lessonPlanCreateClass(index, base = {}) {
  return {
    id: base.id || uid(),
    index: index || 1,
    title: String(base.title || '').trim(),
    date: String(base.date || '').trim(),
    durationHours: String(base.durationHours || '1').trim(),
    durationMinutes: String(base.durationMinutes || '45').trim(),
    pedagogicalIntent: String(base.pedagogicalIntent || '').trim(),
    resourcesPreset: Array.isArray(base.resourcesPreset) ? base.resourcesPreset : [],
    resourcesText: String(base.resourcesText || '').trim(),
    notes: String(base.notes || '').trim(),
    activityLinks: Array.isArray(base.activityLinks) ? base.activityLinks : [],
    start: {
      description: String(base.start?.description || '').trim(),
      activities: String(base.start?.activities || '').trim(),
      duration: String(base.start?.duration || '10').trim(),
    },
    development: {
      description: String(base.development?.description || '').trim(),
      activities: String(base.development?.activities || '').trim(),
      duration: String(base.development?.duration || '25').trim(),
    },
    closure: {
      description: String(base.closure?.description || '').trim(),
      activities: String(base.closure?.activities || '').trim(),
      duration: String(base.closure?.duration || '10').trim(),
      conclusions: String(base.closure?.conclusions || '').trim(),
    },
    adaptation: {
      notes: String(base.adaptation?.notes || '').trim(),
      strategies: String(base.adaptation?.strategies || '').trim(),
    },
  };
}
