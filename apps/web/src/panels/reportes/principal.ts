import { renderizarReportsPanel } from './view.ts';
import { registerReportsActions } from './logic.ts';

export function inicializar() {
  registerReportsActions();
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.reportes = renderizarReportsPanel;
}
