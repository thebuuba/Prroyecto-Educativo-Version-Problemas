import {
  FormState,
  actualizarAreaGrid,
  actualizarGradeGrid,
  actualizarPreviews,
  actualizarSectionGrid,
  actualizarSubjectGrid,
  renderizarGradeSetupPanel,
  subjectsForArea,
} from './components/vista.js';
import { registerGradeSetupActions } from './utils/actions.js';

export function inicializar() {
  registerGradeSetupActions({
    FormState,
    subjectsForArea,
    actualizarGradeGrid,
    actualizarAreaGrid,
    actualizarSubjectGrid,
    actualizarSectionGrid,
    actualizarPreviews,
  });
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS['grade-setup'] = renderizarGradeSetupPanel;
}
