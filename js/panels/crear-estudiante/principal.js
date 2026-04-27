import {
  FormState,
  actualizarPreviews,
  renderizarStudentCreatePanel,
} from './components/vista.js';
import { registerStudentCreateActions } from './utils/actions.js';

export function inicializar() {
  registerStudentCreateActions({ FormState, updatePreviews: actualizarPreviews });
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS['student-create'] = renderizarStudentCreatePanel;
}
