import {
  lessonPlanNew,
  lessonPlanContinue,
  lessonPlanReturnHome,
  lessonPlanSetActiveSection,
  lessonPlanSetGeneralField,
  lessonPlanSetCurriculumField,
} from './actions.ts';
import { lessonPlanPersistDraftNow } from '../../../core/domain-utils.ts';

type PlanningActionContext = {
  trigger: HTMLElement;
  event: Event;
};

type PlanningActionHandler = (context: PlanningActionContext) => boolean | void | Promise<boolean | void>;

function data(trigger: HTMLElement, key: string): string {
  return String(trigger.dataset?.[key] || '').trim();
}

function valueFromTrigger(trigger: HTMLElement): string {
  if (trigger instanceof HTMLInputElement || trigger instanceof HTMLSelectElement || trigger instanceof HTMLTextAreaElement) {
    return trigger.value;
  }
  return data(trigger, 'planningValue') || data(trigger, 'value');
}

function setField(trigger: HTMLElement): void {
  const field = data(trigger, 'target') || data(trigger, 'planningTarget');
  if (!field) return;
  const scope = data(trigger, 'planningScope');
  if (scope === 'curriculum') {
    lessonPlanSetCurriculumField(field, valueFromTrigger(trigger));
    return;
  }
  lessonPlanSetGeneralField(field, valueFromTrigger(trigger));
}

const planningActionRegistry: Record<string, PlanningActionHandler> = {
  create: () => lessonPlanNew(),
  edit: ({ trigger }) => {
    const id = data(trigger, 'planningId');
    if (id) lessonPlanContinue(id);
  },
  delete: () => {},
  save: () => lessonPlanPersistDraftNow(),
  cancel: () => lessonPlanReturnHome(),
  duplicate: () => {},
  'select-grade': ({ trigger }) => lessonPlanSetGeneralField('general.gradeId', valueFromTrigger(trigger)),
  'select-section': ({ trigger }) => lessonPlanSetGeneralField('general.sectionName', valueFromTrigger(trigger)),
  'select-subject': ({ trigger }) => lessonPlanSetGeneralField('general.subject', valueFromTrigger(trigger)),
  'select-period': ({ trigger }) => lessonPlanSetGeneralField('general.periodId', valueFromTrigger(trigger)),
  generate: () => lessonPlanNew(),
  print: () => window.print(),
  export: () => window.print(),
  'open-template': () => {},
  'apply-template': () => {},
  filter: ({ trigger }) => setField(trigger),
  'clear-filter': () => {},
  'select-step': ({ trigger }) => {
    const stepId = data(trigger, 'planningSectionId') || data(trigger, 'value');
    if (stepId) lessonPlanSetActiveSection(stepId);
  },
  'update-field': ({ trigger }) => setField(trigger),
};

export function handleDeclarativePlanningAction(trigger: Element, event: Event): boolean {
  if (!(trigger instanceof HTMLElement)) return false;
  const action = data(trigger, 'planningAction');
  const handler = planningActionRegistry[action];
  if (!handler) {
    console.warn('[EduGest][planning-actions] Acción no permitida.', { action });
    return false;
  }

  const expectedEvent = data(trigger, 'planningEvent');
  if (expectedEvent && expectedEvent !== event.type) return false;

  if (event.type === 'click') {
    event.preventDefault();
    event.stopPropagation();
  }

  void handler({ trigger, event });
  return true;
}
