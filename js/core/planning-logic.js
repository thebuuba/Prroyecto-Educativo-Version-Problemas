import { S } from './state.js';
import { uid, normTxt } from './utils.js';
import { persist } from './hydration.js';
import { restoreSpanishQuestionCorruption, curriculumNormalizeSpecificCompetencyText } from './string-utils.js';
import { curriculumNormalizeGradeKey } from './curriculum-logic.js';

/**
 * Lesson Planning Logic
 * --------------------------------------------------------------------------
 */

export function lessonPlanStoredGroupId(plan) {
  return plan?.groupId || plan?.general?.groupId || plan?.general?.sectionId || '';
}

export function lessonPlanStoredPeriodId(plan) {
  return plan?.periodId || plan?.general?.periodId || S.activePeriodId || 'P1';
}

export function lessonPlanTeacherName() {
  return String(S.profile?.name || S.sessionUserName || '').trim();
}

export function lessonPlanInstitutionName() {
  return String(S.profile?.inst || '').trim();
}

export function lessonPlanAreaFromGroup(group) {
  const subject = String(group?.materia || '').toLowerCase();
  if (/(biologia|quimica|fisica|ciencia|naturaleza|tierra|vida)/.test(subject)) return 'Ciencias de la Naturaleza';
  if (/(lengua|literaria|texto|periodistic|publicitario|espanol)/.test(subject)) return 'Lengua Española';
  if (/(matemat|algebra|geometr)/.test(subject)) return 'Matemática';
  if (/(social|historia|geografia|geografía)/.test(subject)) return 'Ciencias Sociales';
  if (/ingles|english|frances|franc[eé]s/.test(subject)) return 'Lenguas Extranjeras';
  return group?.area || '';
}

export function lessonPlanTransversalAxisDescription(value) {
  if (typeof window.LESSON_PLAN_TRANSVERSAL_AXES === 'undefined') return '';
  const selected = window.LESSON_PLAN_TRANSVERSAL_AXES.find((item) => item.value === String(value || '').trim());
  return selected?.description || '';
}

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

export function lessonPlanNormalizePlan(plan) {
  const base = plan && typeof plan === 'object' ? plan : {};
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

export function lessonPlansForGroup(groupId = S.activeGroupId) {
  ensureLessonPlansState();
  return (S.lessonPlans || [])
    .filter((plan) => lessonPlanStoredGroupId(plan) === groupId && (!lessonPlanStoredPeriodId(plan) || lessonPlanStoredPeriodId(plan) === S.activePeriodId))
    .sort((a, b) => String(b.general?.classDate || b.general?.startDate || '').localeCompare(String(a.general?.classDate || a.general?.startDate || ''), 'es') || (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}

export function lessonPlanDrafts() {
  ensureLessonPlansState();
  return (S.lessonPlans || [])
    .filter((plan) => (plan.status || 'draft') !== 'completed')
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}

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

export function lessonPlanBlockLabel(blockId) {
  const labels = { B1: 'Bloque 1', B2: 'Bloque 2', B3: 'Bloque 3', B4: 'Bloque 4' };
  return labels[blockId] || 'Bloque';
}

export function lessonPlanDraft() {
  ensureLessonPlansState();
  return S.lessonPlanDraft;
}

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

export function lessonPlanFullGradeName(group, grade) {
  if (grade?.name) return grade.name;
  if (group?.grado) return group.grado;
  return '';
}

export function lessonPlanAvailableGrades() {
  return (S.grades || []).map(g => ({ id: g.id, name: g.name }));
}

export function lessonPlanSectionOptionsForGradeId(gradeId) {
  if (!gradeId) return [];
  return (S.secciones || [])
    .filter(s => s.gradeId === gradeId)
    .map(s => ({ value: s.sec, label: s.sec }));
}

export function lessonPlanSubjectOptionsForGradeId(gradeId) {
  if (!gradeId) return [];
  const subjects = new Set();
  (S.secciones || [])
    .filter(s => s.gradeId === gradeId)
    .forEach(s => { if (s.materia) subjects.add(s.materia); });
  return Array.from(subjects).map(s => ({ value: s, label: s }));
}

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

export function lessonPlanTodayIso() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function lessonPlanSuggestedNextClassDate(prevDate = '') {
  const base = prevDate ? new Date(prevDate) : new Date();
  if (isNaN(base.getTime())) return lessonPlanTodayIso();
  base.setDate(base.getDate() + 1);
  if (base.getDay() === 0) base.setDate(base.getDate() + 1);
  if (base.getDay() === 6) base.setDate(base.getDate() + 2);
  return base.toISOString().split('T')[0];
}

export function lessonPlanResolveGroupForSelection(gradeId, sectionName) {
  return (S.secciones || []).find(s => s.gradeId === gradeId && s.sec === sectionName) || null;
}

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
