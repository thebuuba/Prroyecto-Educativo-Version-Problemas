import { renderizarSettingsView } from './components/vista.js';

/**
 * UI Rendering
 */

export function renderizarSettingsPanel(container) {
  container.innerHTML = renderizarSettingsView();
}

// Global Registration
export function inicializar() {
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.settings = renderizarSettingsPanel;
}
