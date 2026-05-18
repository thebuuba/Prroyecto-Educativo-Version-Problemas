import { registerPlanningActions } from './logic.ts';
import { renderizarPlanningPanel } from './view.ts';

export function inicializar() {
  registerPlanningActions();
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.planificaciones = renderizarPlanningPanel;
}
