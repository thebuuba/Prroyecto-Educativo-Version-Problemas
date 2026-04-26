/**
 * Acciones y estado interactivo del panel de planificaciones.
 * Se separan del renderizado para mantener el panel principal más legible.
 */

import {
  lessonPlanCreateBlank,
  lessonPlanDraft,
  lessonPlanPersistDraftNow,
  ensureLessonPlansState,
} from '../../../core/domain-utils.js';

function getPlanningState() {
  ensureLessonPlansState();
  return window.S;
}

export function lessonPlanNew() {
  const S = getPlanningState();
  S.lessonPlanDraft = lessonPlanCreateBlank(S.activeGroupId, S.activePeriodId);
  S.lessonPlanUi.mode = 'editor';
  S.lessonPlanUi.activeSectionId = 'general';
  window.go('planificaciones');
}

export function lessonPlanContinue(id) {
  const S = getPlanningState();
  const plan = S.lessonPlans.find((p) => p.id === id);
  if (!plan) return;

  S.lessonPlanDraft = JSON.parse(JSON.stringify(plan));
  S.lessonPlanUi.mode = 'editor';
  S.lessonPlanUi.activeSectionId = plan.editorStep || 'general';
  window.go('planificaciones');
}

export function lessonPlanReturnHome() {
  const S = getPlanningState();
  S.lessonPlanUi.mode = 'home';
  window.go('planificaciones');
}

export function lessonPlanSetActiveSection(sectionId) {
  const S = getPlanningState();
  S.lessonPlanUi.activeSectionId = sectionId;
  lessonPlanPersistDraftNow();
  window.go('planificaciones');
}

export function lessonPlanSetGeneralField(field, value) {
  const draft = lessonPlanDraft();
  const parts = field.split('.');
  if (parts.length === 2) {
    draft[parts[0]][parts[1]] = value;
  } else {
    draft[field] = value;
  }
}

export function lessonPlanSetCurriculumField(field, value) {
  const draft = lessonPlanDraft();
  draft.curriculum[field] = value;
}

export function registerPlanningActions() {
  window.lessonPlanNew = lessonPlanNew;
  window.lessonPlanContinue = lessonPlanContinue;
  window.lessonPlanReturnHome = lessonPlanReturnHome;
  window.lessonPlanSetActiveSection = lessonPlanSetActiveSection;
  window.lessonPlanSetGeneralField = lessonPlanSetGeneralField;
  window.lessonPlanSetCurriculumField = lessonPlanSetCurriculumField;
}

export { getPlanningState };
