import { registrarStudentsPanel } from './view.ts';
import { registerStudentsActions } from './logic.ts';

export function inicializar() {
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.estudiantes = registrarStudentsPanel;
  registerStudentsActions();
}
