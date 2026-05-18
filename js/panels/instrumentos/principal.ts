import { renderizarInstrumentsPanel } from './view.ts';
import { registerInstrumentActions } from './utils/instrument-actions.ts';

export function inicializar() {
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.instrumentos = (c) => renderizarInstrumentsPanel(c);
  registerInstrumentActions();
}
