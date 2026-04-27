import { S } from '../../core/state.js';
import { persist } from '../../core/hydration.js';
import { openM, toast } from '../../core/domain-utils.js';
import {
  INSTRUMENT_META,
  UI,
  renderizarInstrumentsPanel,
} from './components/vista.js';

export function inicializar() {
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.instrumentos = (c) => renderizarInstrumentsPanel(c);
}

window.setInstFilter = (key, val) => {
  UI.filters[key] = val;
  renderizarInstrumentsPanel(document.getElementById('p-content'));
};

window.createNewInstrument = (type) => {
  toast(`Iniciando creador de ${INSTRUMENT_META[type].title}...`, false);
};

window.editInstrument = (id) => {
  toast(`Cargando editor para el instrumento ${id}...`, false);
};

window.deleteInstrument = (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este instrumento?')) return;
  S.instruments = S.instruments.filter(i => i.id !== id);
  persist();
  renderizarInstrumentsPanel(document.getElementById('p-content'));
  toast('Instrumento eliminado');
};

window.openInstrumentCreator = () => {
  openM('m-inst-type');
};
