import { createUserFromModal, deleteUserById } from './user-domain-actions.ts';

export function saveUsr(): boolean {
  return createUserFromModal();
}

export function delUsr(id?: string): boolean {
  return deleteUserById(String(id || '').trim());
}
