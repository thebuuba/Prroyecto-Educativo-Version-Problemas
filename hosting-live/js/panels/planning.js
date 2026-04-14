import { registerPlanningActions } from './planning-actions.js';
import { renderPlanningPanel } from './planning-render.js';

export function init() {
  registerPlanningActions();
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.planificaciones = renderPlanningPanel;
}
