import { registrarStudentsPanel } from './components/vista.js';
import { registerStudentsActions } from './utils/actions.js';

export function inicializar() {
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.estudiantes = registrarStudentsPanel;
  registerStudentsActions();
}
