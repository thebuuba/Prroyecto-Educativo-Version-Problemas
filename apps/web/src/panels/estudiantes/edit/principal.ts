import {
  FormState,
  actualizarSync,
  renderizarStudentEditPanel,
} from './view.ts';
import { registerStudentEditActions } from './logic.ts';

export function inicializar() {
  registerStudentEditActions({ FormState, updateSync: actualizarSync });
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS['student-edit'] = renderizarStudentEditPanel;
}
