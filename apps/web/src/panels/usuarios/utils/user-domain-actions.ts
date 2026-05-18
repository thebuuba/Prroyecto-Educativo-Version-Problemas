import { persist } from '../../../../../../js/core/hydration.ts';
import { go } from '../../../../../../js/core/routing.ts';
import { S } from '../../../../../../js/core/state.ts';
import { closeM, toast } from '../../../../../../js/core/ui.ts';
import { uid } from '../../../../../../js/core/utils.ts';

function inputValue(id: string): string {
  const field = document.getElementById(id);
  if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
    return field.value.trim();
  }
  return '';
}

export function createUserFromModal(): boolean {
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
  return true;
}

export function deleteUserById(userId: string): boolean {
  if (!userId) return false;
  if (!confirm('¿Eliminar este usuario de acceso adicional?')) return true;
  S.usuarios = (S.usuarios || []).filter((user) => user.id !== userId);
  persist({ immediate: true });
  go('usuarios');
  toast('Usuario eliminado');
  return true;
}
