import { renderizarMatrixPanel } from './view.ts';

export function inicializar() {
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.matriz = renderizarMatrixPanel;
}
