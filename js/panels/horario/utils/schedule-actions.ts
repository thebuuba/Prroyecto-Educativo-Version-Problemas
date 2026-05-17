type ScheduleActionContext = {
  trigger: HTMLElement;
  event: Event;
};

type ScheduleActionHandler = (context: ScheduleActionContext) => boolean | void | Promise<boolean | void>;

function data(trigger: HTMLElement, key: string): string {
  return String(trigger.dataset?.[key] || '').trim();
}

function valueFromTrigger(trigger: HTMLElement): string {
  if (trigger instanceof HTMLInputElement || trigger instanceof HTMLSelectElement || trigger instanceof HTMLTextAreaElement) {
    return trigger.value;
  }
  return data(trigger, 'scheduleValue') || data(trigger, 'value');
}

function callAllowedWindowFunction(name: string, ...args: unknown[]): boolean {
  const fn = (window as Record<string, unknown>)[name];
  if (typeof fn !== 'function') return false;
  fn(...args);
  return true;
}

const scheduleActionRegistry: Record<string, ScheduleActionHandler> = {
  create: () => {
    callAllowedWindowFunction('openScheduleWizard');
  },
  edit: ({ trigger }) => {
    callAllowedWindowFunction(
      'editScheduleCell',
      Number.parseInt(data(trigger, 'scheduleDay'), 10),
      data(trigger, 'scheduleTime'),
      data(trigger, 'scheduleEndTime'),
    );
  },
  delete: () => {},
  save: () => {},
  cancel: () => {},
  'add-block': ({ trigger }) => {
    if (data(trigger, 'scheduleTarget') === 'event') {
      callAllowedWindowFunction('openAddEventModal');
      return;
    }
    callAllowedWindowFunction(
      'editScheduleCell',
      Number.parseInt(data(trigger, 'scheduleDay'), 10),
      data(trigger, 'scheduleTime'),
      data(trigger, 'scheduleEndTime'),
    );
  },
  'edit-block': ({ trigger }) => {
    callAllowedWindowFunction(
      'editScheduleCell',
      Number.parseInt(data(trigger, 'scheduleDay'), 10),
      data(trigger, 'scheduleTime'),
      data(trigger, 'scheduleEndTime'),
    );
  },
  'delete-block': () => {},
  'select-day': () => {},
  'select-time': () => {},
  'select-subject': () => {},
  'select-teacher': () => {},
  'select-course': () => {},
  'select-section': () => {},
  'change-view': ({ trigger }) => {
    const view = data(trigger, 'scheduleView') || valueFromTrigger(trigger);
    callAllowedWindowFunction('setScheduleTab', view);
  },
  clear: () => {},
  print: () => window.print(),
  export: () => {},
  'open-wizard': () => {
    callAllowedWindowFunction('openScheduleWizard');
  },
  'close-wizard': () => {},
  generate: () => {
    if (!callAllowedWindowFunction('generateTeacherScheduleBase')) {
      callAllowedWindowFunction('openScheduleWizard');
    }
  },
  'previous-week': () => {},
  'next-week': () => {},
  'previous-month': () => {
    callAllowedWindowFunction('changeCalendarMonth', -1);
  },
  'next-month': () => {
    callAllowedWindowFunction('changeCalendarMonth', 1);
  },
  'add-event': () => {
    callAllowedWindowFunction('openAddEventModal');
  },
};

export function handleDeclarativeScheduleAction(trigger: Element, event: Event): boolean {
  if (!(trigger instanceof HTMLElement)) return false;
  const action = data(trigger, 'scheduleAction');
  const handler = scheduleActionRegistry[action];
  if (!handler) {
    console.warn('[EduGest][schedule-actions] Acción no permitida.', { action });
    return false;
  }

  if (event.type === 'click' || event.type === 'dblclick') {
    event.preventDefault();
    event.stopPropagation();
  }

  void handler({ trigger, event });
  return true;
}
