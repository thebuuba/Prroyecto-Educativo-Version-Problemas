import {
  FormState,
  actualizarPreviews,
  actualizarSubjectGrid,
  obtenerAreaCatalogForCurrentGrade,
  renderizarSectionCreatePanel,
} from './components/vista.js';
import { registerSectionCreateActions } from './utils/actions.js';

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
