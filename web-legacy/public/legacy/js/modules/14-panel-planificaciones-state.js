// Devuelve el modo visible del modulo para decidir si mostramos listado o editor completo.
function lessonPlanUiMode() {
  ensureLessonPlansState();
  return S.lessonPlanUi.mode === 'editor' ? 'editor' : 'home';
}

// Cambia el modo principal de planificaciones entre inicio y editor.
function lessonPlanSetMode(mode = 'home') {
  ensureLessonPlansState();
  S.lessonPlanUi.mode = mode === 'editor' ? 'editor' : 'home';
}

// Programa un autosave corto del borrador para no perder cambios mientras se edita la planificación.
function lessonPlanQueueAutosave() {
  ensureLessonPlansState();
  if (lessonPlanUiMode() !== 'editor') return;
  lessonPlanCancelAutosave();
  S.lessonPlanUi.autosaveTimer = setTimeout(() => {
    lessonPlanPersistDraftNow('draft');
  }, 320);
}

// Fuerza el guardado pendiente antes de salir del editor o cerrar la página.
function lessonPlanFlushPendingAutosave() {
  ensureLessonPlansState();
  if (lessonPlanUiMode() !== 'editor') return;
  if (!S.lessonPlanUi.autosaveTimer && !lessonPlanShouldKeep(S.lessonPlanDraft)) return;
  lessonPlanPersistDraftNow('draft');
}

// Expande o contrae una clase del editor para enfocar la edición en ese bloque.
function lessonPlanToggleClassExpansion(classId) {
  ensureLessonPlansState();
  const list = Array.isArray(S.lessonPlanUi.expandedClassIds) ? S.lessonPlanUi.expandedClassIds : [];
  if (list.includes(classId)) S.lessonPlanUi.expandedClassIds = list.filter((item) => item !== classId);
  else S.lessonPlanUi.expandedClassIds = [...list, classId];
  lessonPlanRefreshOpenSectionModal();
}

// Lee la sección activa del asistente de planificación para mantener navegación y validaciones alineadas.
function lessonPlanActiveSection() {
  ensureLessonPlansState();
  return String(S.lessonPlanUi.activeSectionId || '');
}

// Cambia la sección activa del editor, persiste el paso actual y reubica el scroll en el compositor.
function lessonPlanSetActiveSection(sectionId) {
  ensureLessonPlansState();
  const next = String(sectionId || '');
  S.lessonPlanUi.activeSectionId = next || 'general';
  if (S.lessonPlanDraft && typeof S.lessonPlanDraft === 'object') {
    S.lessonPlanDraft.editorStep = S.lessonPlanUi.activeSectionId;
    lessonPlanQueueAutosave();
  }
  lessonPlanRefreshOpenSectionModal();
  setTimeout(() => {
    scrollToLessonPlanComposer(false);
  }, 20);
}

// Abre una nueva planificación usando el grupo seleccionado como contexto inicial.
function openPlanningForGroup(groupId) {
  if (groupId) setActiveGroup(groupId);
  lessonPlanNew({ groupId: groupId || S.activeGroupId || '', periodId: S.activePeriodId, useContext: true });
}
