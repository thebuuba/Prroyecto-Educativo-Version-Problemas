import { registerPlanningActions } from './utils/actions.js';
import { renderizarPlanningPanel } from './components/vista.js';

export function inicializar() {
  registerPlanningActions();
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.planificaciones = renderizarPlanningPanel;
}
