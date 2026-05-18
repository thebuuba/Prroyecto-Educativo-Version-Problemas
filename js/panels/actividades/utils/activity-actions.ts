import {
  addActToBlock,
  autoAdjustBlock,
  handleActNameInput,
  removeActFromBlock,
  setActView,
  updateActPts,
  updateBlockMeta,
} from './actions.ts';
import {
  confirmLinkInstrument,
  createNewInstrument,
  deleteInstrument,
  editInstrument,
  openApplyInstrumentModal,
  openCreateInstrumentTypePicker,
  openInstrumentCreator,
  setInstFilter,
} from '../../instrumentos/utils/instrument-actions.ts';

type ActivityActionContext = {
  trigger: HTMLElement;
  event: Event;
};

type ActivityActionHandler = (context: ActivityActionContext) => boolean | void | Promise<boolean | void>;

function data(trigger: HTMLElement, key: string): string {
  return String(trigger.dataset?.[key] || '').trim();
}

function valueFromTrigger(trigger: HTMLElement): string {
  if (trigger instanceof HTMLInputElement || trigger instanceof HTMLSelectElement || trigger instanceof HTMLTextAreaElement) {
    return trigger.value;
  }
  return data(trigger, 'activityValue') || data(trigger, 'gradeValue') || data(trigger, 'value');
}

function callAllowedWindowFunction(name: string, ...args: unknown[]): boolean {
  const fn = (window as Record<string, unknown>)[name];
  if (typeof fn !== 'function') return false;
  fn(...args);
  return true;
}

function blockId(trigger: HTMLElement): string {
  return data(trigger, 'blockId');
}

function activityId(trigger: HTMLElement): string {
  return data(trigger, 'activityId');
}

function instrumentId(trigger: HTMLElement): string {
  return data(trigger, 'instrumentId');
}

const activityActionRegistry: Record<string, ActivityActionHandler> = {
  create: ({ trigger }) => {
    const targetBlockId = blockId(trigger);
    if (targetBlockId) {
      void addActToBlock(targetBlockId);
      return;
    }
    callAllowedWindowFunction('saveAct');
  },
  edit: ({ trigger }) => {
    const targetBlockId = blockId(trigger);
    const targetActivityId = activityId(trigger);
    if (targetBlockId && targetActivityId) {
      void handleActNameInput(targetBlockId, targetActivityId, trigger);
    }
  },
  delete: ({ trigger }) => {
    const targetBlockId = blockId(trigger);
    const targetActivityId = activityId(trigger);
    if (targetBlockId && targetActivityId) {
      void removeActFromBlock(targetBlockId, targetActivityId);
    }
  },
  save: ({ trigger }) => {
    const target = data(trigger, 'target') || data(trigger, 'activityTarget');
    if (target === 'template') {
      callAllowedWindowFunction('saveTpl');
      return;
    }
    callAllowedWindowFunction('saveAct');
  },
  cancel: () => {},
  'select-block': ({ trigger }) => {
    const targetBlockId = blockId(trigger);
    if (targetBlockId) updateBlockMeta(targetBlockId, valueFromTrigger(trigger));
  },
  'create-block': ({ trigger }) => {
    const targetBlockId = blockId(trigger);
    if (targetBlockId) void addActToBlock(targetBlockId);
  },
  'edit-block': () => {},
  'delete-block': () => {},
  'select-instrument': ({ trigger }) => {
    const targetActivityId = activityId(trigger) || String((window as Record<string, unknown>)._linkActId || '').trim();
    if (targetActivityId) openApplyInstrumentModal(targetActivityId);
  },
  'create-instrument': ({ trigger }) => {
    const type = valueFromTrigger(trigger);
    const targetActivityId = activityId(trigger) || String((window as Record<string, unknown>)._linkActId || '').trim();
    if (type) {
      createNewInstrument(type);
      return;
    }
    if (targetActivityId && openCreateInstrumentTypePicker(targetActivityId)) return;
    openInstrumentCreator();
  },
  'edit-instrument': ({ trigger }) => {
    const id = instrumentId(trigger);
    if (id) editInstrument(id);
  },
  'delete-instrument': ({ trigger }) => {
    const id = instrumentId(trigger);
    if (id) deleteInstrument(id);
  },
  'save-instrument': () => {
    confirmLinkInstrument();
  },
  'evaluate-student': ({ trigger }) => {
    const targetActivityId = activityId(trigger);
    const studentId = data(trigger, 'studentId');
    if (!targetActivityId) return;
    openApplyInstrumentModal(targetActivityId, studentId || undefined);
  },
  'change-grade': ({ trigger }) => {
    const targetBlockId = blockId(trigger);
    const targetActivityId = activityId(trigger);
    if (targetBlockId && targetActivityId) {
      void updateActPts(targetBlockId, targetActivityId, valueFromTrigger(trigger));
    }
  },
  'clear-grade': () => {},
  'save-grades': () => {
    callAllowedWindowFunction('saveAct');
  },
  'open-matrix': () => {
    setActView('matrix');
  },
  'edit-matrix': ({ trigger }) => {
    const targetActivityId = activityId(trigger);
    if (targetActivityId) openApplyInstrumentModal(targetActivityId, data(trigger, 'studentId'));
  },
  'change-matrix-view': ({ trigger }) => {
    setActView(data(trigger, 'matrixView') || valueFromTrigger(trigger));
  },
  filter: ({ trigger }) => {
    const target = data(trigger, 'target') || data(trigger, 'activityTarget');
    if (target) setInstFilter(target, valueFromTrigger(trigger));
  },
  'clear-filter': ({ trigger }) => {
    const target = data(trigger, 'target') || data(trigger, 'activityTarget');
    if (target) setInstFilter(target, '');
  },
  export: () => {},
  print: () => window.print(),
  'calculate-average': ({ trigger }) => {
    const targetBlockId = blockId(trigger);
    if (targetBlockId) autoAdjustBlock(targetBlockId);
  },
  sync: () => {},
};

export function handleDeclarativeActivityAction(trigger: Element, event: Event): boolean {
  if (!(trigger instanceof HTMLElement)) return false;
  const action = data(trigger, 'activityAction');
  const handler = activityActionRegistry[action];
  if (!handler) {
    console.warn('[EduGest][activity-actions] Acción no permitida.', { action });
    return false;
  }

  const expectedEvent = data(trigger, 'activityEvent');
  if (expectedEvent && expectedEvent !== event.type) return false;

  if (event.type === 'click' || event.type === 'dblclick') {
    event.preventDefault();
    event.stopPropagation();
  }

  void handler({ trigger, event });
  return true;
}
