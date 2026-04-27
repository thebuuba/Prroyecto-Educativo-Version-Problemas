import { renderizarMatrixPanel } from './components/vista.js';

export function inicializar() {
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.matriz = renderizarMatrixPanel;
}
