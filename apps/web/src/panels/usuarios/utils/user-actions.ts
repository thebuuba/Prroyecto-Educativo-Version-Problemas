import { S } from '../../../../../../js/core/state.ts';
import { persist } from '../../../../../../js/core/hydration.ts';
import { go } from '../../../../../../js/core/routing.ts';
import { openM, closeM } from '../../../../../../js/core/ui.ts';
import { delUsr, saveUsr } from './user-save.ts';

type UserActionContext = {
  trigger: HTMLElement;
  event: Event;
};

type UserActionHandler = (context: UserActionContext) => boolean | void | Promise<boolean | void>;

function data(trigger: HTMLElement, key: string): string {
  return String(trigger.dataset?.[key] || '').trim();
}

function valueFromTrigger(trigger: HTMLElement): string {
  if (trigger instanceof HTMLInputElement || trigger instanceof HTMLSelectElement || trigger instanceof HTMLTextAreaElement) {
    return trigger.value;
  }
  return data(trigger, 'userValue') || data(trigger, 'value');
}

function openUserModal(trigger: HTMLElement): void {
  const modalId = data(trigger, 'userModalId') || 'm-usr';
  openM(modalId);
}

function deleteUser(trigger: HTMLElement): void {
  const userId = data(trigger, 'userId');
  if (!userId) return;
  delUsr(userId);
}

const userActionRegistry: Record<string, UserActionHandler> = {
  create: ({ trigger }) => openUserModal(trigger),
  edit: () => {},
  delete: ({ trigger }) => deleteUser(trigger),
  save: () => saveUsr(),
  cancel: ({ trigger }) => closeM(data(trigger, 'userModalId') || 'm-usr'),
  'select-role': () => {},
  'change-permission': () => {},
  activate: () => {},
  deactivate: () => {},
  'reset-password': () => {},
  'open-modal': ({ trigger }) => openUserModal(trigger),
  filter: () => {},
  'clear-filter': () => {},
  search: () => {},
  invite: () => {},
  'update-profile': () => {},
  'save-profile': () => {},
  'change-status': ({ trigger }) => {
    const userId = data(trigger, 'userId');
    const status = data(trigger, 'userStatus') || valueFromTrigger(trigger);
    if (!userId || !status) return;
    const user = (S.usuarios || []).find((item) => item.id === userId);
    if (user) user.status = status;
    persist({ immediate: true });
    go('usuarios');
  },
};

export function handleDeclarativeUserAction(trigger: Element, event: Event): boolean {
  if (!(trigger instanceof HTMLElement)) return false;
  const action = data(trigger, 'userAction');
  const handler = userActionRegistry[action];
  if (!handler) {
    console.warn('[EduGest][user-actions] Acción no permitida.', { action });
    return false;
  }

  const expectedEvent = data(trigger, 'userEvent');
  if (expectedEvent && expectedEvent !== event.type) return false;

  if (event.type === 'click') {
    event.preventDefault();
    event.stopPropagation();
  }

  void handler({ trigger, event });
  return true;
}
