import { renderizarActivitiesPanel } from './components/vista.js';
import { registerActivitiesActions } from './utils/actions.js';

export function inicializar() {
  registerActivitiesActions();
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.actividades = renderizarActivitiesPanel;
}
