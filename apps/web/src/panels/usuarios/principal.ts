/**
 * Additional Users Panel Module
 * Modernized version of the coordinator/co-teacher management system.
 */

import { S } from '../../../../../js/core/state.ts';
import { renderizarUsersView } from './view.ts';
import { delUsr, saveUsr } from './utils/user-save.ts';

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
  window.saveUsr = saveUsr;
  window.delUsr = delUsr;
}
