type FormActionEvent = Event | KeyboardEvent | FocusEvent;
type FormHandler = (target: HTMLElement, event: FormActionEvent) => boolean;

function getDatasetValue(element: Element, key: string): string {
  return String((element as HTMLElement).dataset?.[key] || '').trim();
}

function callLegacy(name: string, ...args: unknown[]): boolean {
  const fn = (window as Record<string, unknown>)[name];
  if (typeof fn !== 'function') {
    console.warn(`[EduGest][form-actions] Handler legacy no disponible: ${name}`);
    return false;
  }
  fn(...args);
  return true;
}

const inputHandlers: Record<string, FormHandler> = {
  'setup-phone': (target) => callLegacy('handlePhoneInput', target),
  'setup-institution': (target) => callLegacy('handleInstitutionInput', target),
};

const keydownHandlers: Record<string, FormHandler> = {
  'setup-institution': (_target, event) => callLegacy('handleInstitutionKeydown', event),
};

const focusHandlers: Record<string, FormHandler> = {
  'setup-institution': (target) => callLegacy('updateInstitutionInlineHint', target),
};

const blurHandlers: Record<string, FormHandler> = {
  'setup-institution': () => callLegacy('clearInstitutionInlineHint'),
};

function runHandler(registry: Record<string, FormHandler>, datasetKey: string, target: Element, event: FormActionEvent): boolean {
  const handlerKey = getDatasetValue(target, datasetKey);
  if (!handlerKey) return false;

  const handler = registry[handlerKey];
  if (!handler) {
    console.warn(`[EduGest][form-actions] Handler declarativo no soportado: ${handlerKey}`);
    return false;
  }

  return handler(target as HTMLElement, event);
}

export function handleDeclarativeInput(target: Element, event: Event): boolean {
  return runHandler(inputHandlers, 'inputHandler', target, event);
}

export function handleDeclarativeKeydown(target: Element, event: KeyboardEvent): boolean {
  return runHandler(keydownHandlers, 'keydownHandler', target, event);
}

export function handleDeclarativeFocus(target: Element, event: FocusEvent): boolean {
  return runHandler(focusHandlers, 'focusHandler', target, event);
}

export function handleDeclarativeBlur(target: Element, event: FocusEvent): boolean {
  return runHandler(blurHandlers, 'blurHandler', target, event);
}
