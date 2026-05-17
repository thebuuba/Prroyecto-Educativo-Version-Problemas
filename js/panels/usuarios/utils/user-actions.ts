import { S } from '../../../core/state.ts';
import { persist } from '../../../core/hydration.ts';
import { go } from '../../../core/routing.ts';
import { openM, closeM, toast } from '../../../core/ui.ts';
import { uid } from '../../../core/utils.ts';

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

function inputValue(id: string): string {
  const field = document.getElementById(id);
  if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
    return field.value.trim();
  }
  return '';
}

function callAllowedWindowFunction(name: string, ...args: unknown[]): boolean {
  const fn = (window as Record<string, unknown>)[name];
  if (typeof fn !== 'function') return false;
  fn(...args);
  return true;
}

function openUserModal(trigger: HTMLElement): void {
  const modalId = data(trigger, 'userModalId') || 'm-usr';
  openM(modalId);
}

function saveUser(): void {
  if (callAllowedWindowFunction('saveUsr')) return;

  const nombre = inputValue('u-nom');
  const email = inputValue('u-email');
  const rol = inputValue('u-rol') || 'Docente';
  const sectionId = inputValue('u-sec');

  const user = {
    id: uid(),
    nombre,
    email,
    rol,
    sectionId,
  };

  if (!S.usuarios) S.usuarios = [];
  S.usuarios.push(user);
  persist({ immediate: true });
  closeM('m-usr');
  go('usuarios');
  toast('Usuario creado');
}

function deleteUser(trigger: HTMLElement): void {
  const userId = data(trigger, 'userId');
  if (!userId) return;
  if (callAllowedWindowFunction('delUsr', userId)) return;
  if (!confirm('¿Eliminar este usuario de acceso adicional?')) return;
  S.usuarios = (S.usuarios || []).filter((user) => user.id !== userId);
  persist({ immediate: true });
  go('usuarios');
  toast('Usuario eliminado');
}

const userActionRegistry: Record<string, UserActionHandler> = {
  create: ({ trigger }) => openUserModal(trigger),
  edit: () => {},
  delete: ({ trigger }) => deleteUser(trigger),
  save: () => saveUser(),
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
