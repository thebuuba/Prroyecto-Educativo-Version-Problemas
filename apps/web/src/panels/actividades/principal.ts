import { renderizarActivitiesPanel } from './view.ts';
import { registerActivitiesActions } from './logic.ts';

export function inicializar() {
  registerActivitiesActions();
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.actividades = renderizarActivitiesPanel;
}
