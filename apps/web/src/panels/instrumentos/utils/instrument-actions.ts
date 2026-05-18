import { S } from '../../../../../../js/core/state.ts';
import { persist } from '../../../../../../js/core/hydration.ts';
import { openM, toast } from '../../../../../../js/core/domain-utils.ts';
import {
  INSTRUMENT_META,
  UI,
  renderizarInstrumentsPanel,
} from '../view.ts';
import {
  confirmLinkInstrument as confirmLinkInstrumentImpl,
  openApplyInstrumentModal as openApplyInstrumentModalImpl,
  openCreateInstrumentTypePicker as openCreateInstrumentTypePickerImpl,
} from './instrument-linking.ts';

function panelContainer(): HTMLElement | null {
  return document.getElementById('p-content');
}

export function setInstFilter(key: string, val: string): boolean {
  if (!key) return false;
  UI.filters[key] = val;
  renderizarInstrumentsPanel(panelContainer());
  return true;
}

export function createNewInstrument(type: string): boolean {
  const meta = INSTRUMENT_META[type];
  if (!meta) return false;
  toast(`Iniciando creador de ${meta.title}...`, false);
  return true;
}

export function editInstrument(id: string): boolean {
  if (!id) return false;
  toast(`Cargando editor para el instrumento ${id}...`, false);
  return true;
}

export function deleteInstrument(id: string): boolean {
  if (!id) return false;
  if (!confirm('¿Estás seguro de que deseas eliminar este instrumento?')) return true;
  S.instruments = S.instruments.filter((item) => item.id !== id);
  persist();
  renderizarInstrumentsPanel(panelContainer());
  toast('Instrumento eliminado');
  return true;
}

export function openInstrumentCreator(): boolean {
  openM('m-inst-type');
  return true;
}

export function openApplyInstrumentModal(activityId: string, studentId?: string): boolean {
  return openApplyInstrumentModalImpl(activityId, studentId);
}

export function openCreateInstrumentTypePicker(activityId: string): boolean {
  return openCreateInstrumentTypePickerImpl(activityId);
}

export function confirmLinkInstrument(): boolean {
  return confirmLinkInstrumentImpl();
}

export function registerInstrumentActions(): void {
  window.setInstFilter = setInstFilter;
  window.createNewInstrument = createNewInstrument;
  window.editInstrument = editInstrument;
  window.deleteInstrument = deleteInstrument;
  window.openInstrumentCreator = openInstrumentCreator;
  window.openApplyInstrumentModal = openApplyInstrumentModal;
  window.openCreateInstrumentTypePicker = openCreateInstrumentTypePicker;
  window.confirmLinkInstrument = confirmLinkInstrument;
}
