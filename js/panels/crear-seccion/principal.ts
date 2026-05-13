import {
  FormState,
  actualizarPreviews,
  actualizarSubjectGrid,
  obtenerAreaCatalogForCurrentGrade,
  renderizarSectionCreatePanel,
} from './view.ts';
import { registerSectionCreateActions } from './logic.ts';

export function inicializar() {
  registerSectionCreateActions({
    FormState,
    actualizarPreviews,
    actualizarSubjectGrid,
    obtenerAreaCatalogForCurrentGrade,
  });
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS['section-create'] = renderizarSectionCreatePanel;
}
