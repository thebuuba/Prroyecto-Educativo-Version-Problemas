import { renderizarReportsPanel } from './components/vista.js';
import { registerReportsActions } from './utils/actions.js';

export function inicializar() {
  registerReportsActions();
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.reportes = renderizarReportsPanel;
}
