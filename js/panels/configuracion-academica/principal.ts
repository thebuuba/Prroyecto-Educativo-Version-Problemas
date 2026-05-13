import {
  FormState,
  actualizarAreaGrid,
  actualizarGradeGrid,
  actualizarPreviews,
  actualizarSectionGrid,
  actualizarSubjectGrid,
  renderizarGradeSetupPanel,
  subjectsForArea,
} from './view.ts';
import { registerGradeSetupActions } from './logic.ts';

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
