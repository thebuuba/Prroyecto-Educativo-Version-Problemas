/**
 * Additional Users Panel Module
 * Modernized version of the coordinator/co-teacher management system.
 */

import { S } from '../../core/state.ts';
import { persist } from '../../core/hydration.ts';
import { go, toast } from '../../core/domain-utils.ts';
import { renderizarUsersView } from './components/vista.js';

/**
 * --- Main Rendering ---
 */

export function renderizarUsersPanel(container) {
  if (!S.usuarios) S.usuarios = [];
  container.innerHTML = renderizarUsersView(S.usuarios);
}

/**
 * --- Global Initializer ---
 */

export function inicializar() {
  window.RENDERS.usuarios = (c) => renderizarUsersPanel(c);
  window.delUsr = async (id) => {
    if (!confirm('¿Eliminar este usuario de acceso adicional?')) return;
    S.usuarios = (S.usuarios || []).filter(u => u.id !== id);
    persist({ immediate: true });
    go('usuarios');
    toast('Usuario eliminado');
  };
}
