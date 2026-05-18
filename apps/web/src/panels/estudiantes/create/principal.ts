import {
  FormState,
  actualizarPreviews,
  renderizarStudentCreatePanel,
} from './view.ts';
import { registerStudentCreateActions } from './logic.ts';

export function inicializar() {
  registerStudentCreateActions({ FormState, updatePreviews: actualizarPreviews });
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS['student-create'] = renderizarStudentCreatePanel;
}
