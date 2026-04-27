import {
  FormState,
  actualizarSync,
  renderizarStudentEditPanel,
} from './components/vista.js';
import { registerStudentEditActions } from './utils/actions.js';

export function inicializar() {
  registerStudentEditActions({ FormState, updateSync: actualizarSync });
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS['student-edit'] = renderizarStudentEditPanel;
}
