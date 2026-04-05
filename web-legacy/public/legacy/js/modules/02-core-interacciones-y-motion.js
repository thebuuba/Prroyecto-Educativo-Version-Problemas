// Construye construir rápido comando entries.
function buildQuickCommandEntries() {
  const isDark = document.body.classList.contains('theme-dark');
  return [
    { id: 'page-dashboard', label: 'Ir a Inicio', description: 'Panel general y métricas', keywords: 'inicio panel dashboard', run: () => go('dashboard', { animatePanelTransition: true }) },
    { id: 'page-estudiantes', label: 'Ir a Estudiantes', description: 'Listado y gestión de estudiantes', keywords: 'estudiantes lista grupo', run: () => go('estudiantes', { animatePanelTransition: true }) },
    { id: 'page-actividades', label: 'Ir a Actividades', description: 'Planifica y organiza actividades', keywords: 'actividades bloques', run: () => go('actividades', { animatePanelTransition: true }) },
    { id: 'page-matriz', label: 'Ir a Matriz General', description: 'Calificaciones por bloque y curso', keywords: 'matriz notas calificaciones', run: () => go('matriz', { animatePanelTransition: true }) },
    { id: 'page-planificaciones', label: 'Ir a Planificaciones', description: 'Diseño y seguimiento de clases', keywords: 'planificaciones lecciones', run: () => go('planificaciones', { animatePanelTransition: true }) },
    { id: 'page-asistencia', label: 'Ir a Registro de Asistencia', description: 'Control de asistencia del curso activo', keywords: 'asistencia asistencia diaria', run: () => go('asistencia', { animatePanelTransition: true }) },
    { id: 'page-reportes', label: 'Ir a Reportes', description: 'Exportaciones y estadísticas', keywords: 'reportes exportar', run: () => go('reportes', { animatePanelTransition: true }) },
    { id: 'page-settings', label: 'Abrir Configuración', description: 'Perfil, ciclo y preferencias', keywords: 'configuración ajustes perfil', run: () => go('settings', { animatePanelTransition: true }) },
    { id: 'open-profile', label: 'Configurar Perfil', description: 'Abre la edición de perfil docente', keywords: 'perfil setup cuenta', run: () => openM('m-setup') },
    { id: 'toggle-theme', label: isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro', description: 'Alterna el tema visual actual', keywords: 'modo oscuro claro tema', run: () => toggleDarkMode() },
  ];
}
// Crea una sola vez la paleta de comandos y deja cacheadas sus referencias DOM para reusarla en toda la app.
function ensureQuickCommandPalette() {
  if (INTERACTION_ENHANCEMENTS.container && INTERACTION_ENHANCEMENTS.input && INTERACTION_ENHANCEMENTS.list) return;
  const shell = document.createElement('div');
  shell.id = 'quick-command-palette';
  shell.className = 'quick-command-palette';
  shell.hidden = true;
  shell.setAttribute('aria-hidden', 'true');
  shell.innerHTML = `
    <div class="quick-command-backdrop" data-action="close"></div>
    <div class="quick-command-dialog" role="dialog" aria-modal="true" aria-label="Acciones rápidas">
      <div class="quick-command-head">
        <input id="quick-command-input" class="quick-command-input" type="text" autocomplete="off" placeholder="Busca una acción... (Ej: estudiantes, reportes, modo oscuro)">
        <span class="quick-command-hint" id="quick-command-hint">0 resultados</span>
      </div>
      <div id="quick-command-list" class="quick-command-list" role="listbox" aria-label="Resultados"></div>
      <div class="quick-command-foot">Atajos: ↑ ↓ para moverte, Enter para ejecutar, Esc para cerrar.</div>
    </div>
  `;
  document.body.appendChild(shell);
  INTERACTION_ENHANCEMENTS.container = shell;
  INTERACTION_ENHANCEMENTS.input = shell.querySelector('#quick-command-input');
  INTERACTION_ENHANCEMENTS.list = shell.querySelector('#quick-command-list');
  INTERACTION_ENHANCEMENTS.hint = shell.querySelector('#quick-command-hint');
}
// Comprueba si is rápido comando palette abrir.
function isQuickCommandPaletteOpen() {
  return !!INTERACTION_ENHANCEMENTS.container && !INTERACTION_ENHANCEMENTS.container.hidden;
}
// Pinta los resultados filtrados y mantiene sincronizada la selección activa del atajo rápido.
function renderQuickCommandResults() {
  const list = INTERACTION_ENHANCEMENTS.list;
  const hint = INTERACTION_ENHANCEMENTS.hint;
  if (!list || !hint) return;
  const rows = INTERACTION_ENHANCEMENTS.filtered;
  if (!rows.length) {
    INTERACTION_ENHANCEMENTS.activeIndex = -1;
    list.innerHTML = '<div class="quick-command-empty">No hay coincidencias para esa búsqueda.</div>';
    hint.textContent = '0 resultados';
    return;
  }
  if (INTERACTION_ENHANCEMENTS.activeIndex < 0 || INTERACTION_ENHANCEMENTS.activeIndex >= rows.length) {
    INTERACTION_ENHANCEMENTS.activeIndex = 0;
  }
  list.innerHTML = rows.map((entry, index) => `
    <button type="button" class="quick-command-item ${index === INTERACTION_ENHANCEMENTS.activeIndex ? 'is-active' : ''}" data-index="${index}" role="option" aria-selected="${index === INTERACTION_ENHANCEMENTS.activeIndex ? 'true' : 'false'}">
      <span class="quick-command-item-label">${escapeHtml(entry.label)}</span>
      <span class="quick-command-item-desc">${escapeHtml(entry.description)}</span>
    </button>
  `).join('');
  hint.textContent = `${rows.length} resultado${rows.length === 1 ? '' : 's'}`;
}
// Filtra acciones rápidas por texto libre sobre etiqueta, descripción y palabras clave.
function filterQuickCommandResults(query = '') {
  const needle = String(query || '').trim().toLowerCase();
  const all = INTERACTION_ENHANCEMENTS.entries || [];
  if (!needle) {
    INTERACTION_ENHANCEMENTS.filtered = all.slice();
    renderQuickCommandResults();
    return;
  }
  INTERACTION_ENHANCEMENTS.filtered = all.filter((entry) => {
    const target = `${entry.label} ${entry.description} ${entry.keywords || ''}`.toLowerCase();
    return target.includes(needle);
  });
  renderQuickCommandResults();
}
// Gestiona move rápido comando selection.
function moveQuickCommandSelection(step) {
  // Desplaza la selección activa dentro de los resultados visibles del buscador global.
  const rows = INTERACTION_ENHANCEMENTS.filtered;
  if (!rows.length) return;
  const size = rows.length;
  let nextIndex = INTERACTION_ENHANCEMENTS.activeIndex + step;
  if (nextIndex < 0) nextIndex = size - 1;
  if (nextIndex >= size) nextIndex = 0;
  INTERACTION_ENHANCEMENTS.activeIndex = nextIndex;
  renderQuickCommandResults();
  INTERACTION_ENHANCEMENTS.list?.querySelector('.quick-command-item.is-active')?.scrollIntoView({ block: 'nearest' });
}
// Gestiona run rápido comando at.
function runQuickCommandAt(index) {
  // Ejecuta la acción elegida y cierra la paleta para dejar limpio el foco de navegación.
  const entry = INTERACTION_ENHANCEMENTS.filtered?.[index];
  if (!entry || typeof entry.run !== 'function') return;
  closeQuickCommandPalette();
  entry.run();
}
// Abre la paleta con el catálogo actualizado de acciones y enfoca el input para búsqueda inmediata.
function openQuickCommandPalette() {
  ensureQuickCommandPalette();
  const shell = INTERACTION_ENHANCEMENTS.container;
  const input = INTERACTION_ENHANCEMENTS.input;
  if (!shell || !input) return;
  INTERACTION_ENHANCEMENTS.entries = buildQuickCommandEntries();
  INTERACTION_ENHANCEMENTS.filtered = INTERACTION_ENHANCEMENTS.entries.slice();
  INTERACTION_ENHANCEMENTS.activeIndex = 0;
  shell.hidden = false;
  shell.setAttribute('aria-hidden', 'false');
  document.body.classList.add('quick-command-open');
  input.value = '';
  renderQuickCommandResults();
  window.requestAnimationFrame(() => {
    input.focus();
    input.select();
  });
}
// Cierra la paleta y limpia las clases globales que bloquean interacción con el fondo.
function closeQuickCommandPalette() {
  const shell = INTERACTION_ENHANCEMENTS.container;
  if (!shell || shell.hidden) return;
  shell.hidden = true;
  shell.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('quick-command-open');
}
// Alterna alternar rápido comando palette.
function toggleQuickCommandPalette() {
  // Abre o cierra la paleta según su estado actual para reutilizarla desde teclado o UI.
  if (isQuickCommandPaletteOpen()) closeQuickCommandPalette();
  else openQuickCommandPalette();
}
// Conecta clicks, teclado y cierres del overlay para que la paleta funcione como un buscador de acciones global.
function bindQuickCommandPaletteEvents() {
  if (INTERACTION_ENHANCEMENTS.quickPaletteBound) return;
  ensureQuickCommandPalette();
  const shell = INTERACTION_ENHANCEMENTS.container;
  const input = INTERACTION_ENHANCEMENTS.input;
  const list = INTERACTION_ENHANCEMENTS.list;
  if (!shell || !input || !list) return;
  shell.addEventListener('click', (event) => {
    if (event.target?.closest?.('[data-action="close"]')) {
      closeQuickCommandPalette();
      return;
    }
    const item = event.target?.closest?.('.quick-command-item');
    if (!item) return;
    const index = Number(item.getAttribute('data-index'));
    if (Number.isFinite(index)) runQuickCommandAt(index);
  });
  input.addEventListener('input', () => {
    filterQuickCommandResults(input.value);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveQuickCommandSelection(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveQuickCommandSelection(-1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      runQuickCommandAt(INTERACTION_ENHANCEMENTS.activeIndex);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeQuickCommandPalette();
      return;
    }
  });
  INTERACTION_ENHANCEMENTS.quickPaletteBound = true;
}
// Añade una respuesta visual leve en botones y navegación sin interferir con los componentes interactivos especiales.
function bindTapRippleFeedback() {
  if (INTERACTION_ENHANCEMENTS.rippleBound) return;
  document.addEventListener('pointerdown', (event) => {
    if (!canAnimateUiMotion()) return;
    const trigger = event.target?.closest?.('.btn, .sb-link, .sb-utility, .sb-logout-compact, .topbar-brand, .top-profile-toggle');
    if (!trigger || !(trigger instanceof HTMLElement)) return;
    if (trigger.classList.contains('quick-command-item')) return;
    const rect = trigger.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    trigger.classList.add('has-tap-ripple');
    const ripple = document.createElement('span');
    ripple.className = 'tap-ripple';
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - (size / 2)}px`;
    ripple.style.top = `${event.clientY - rect.top - (size / 2)}px`;
    trigger.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }, { passive: true });
  INTERACTION_ENHANCEMENTS.rippleBound = true;
}
// Inicializa una sola vez las mejoras globales de interacción compartidas por todos los paneles.
function initInteractionEnhancements() {
  if (INTERACTION_ENHANCEMENTS.initialized) return;
  bindQuickCommandPaletteEvents();
  bindTapRippleFeedback();
  INTERACTION_ENHANCEMENTS.initialized = true;
}
// Resuelve el perfil de motion preferido por el usuario para decidir cuánta animación aplicar.
function getMotionProfile() {
  try {
    const saved = String(window.localStorage?.getItem('edugestMotionProfile') || '').trim().toLowerCase();
    if (saved === 'fast') return 'fast';
  } catch (_) {}
  return 'smooth';
}
// Aplica aplicar movimiento perfil.
function applyMotionProfile() {
  // Publica el perfil visual actual en el body para que CSS y JS respondan con la misma velocidad.
  const profile = getMotionProfile();
  document.body.classList.toggle('motion-smooth', profile === 'smooth');
  document.body.classList.toggle('motion-fast', profile === 'fast');
}
// Expone el panel activo como atributo de datos para CSS, motion y depuración contextual.
function setActivePanelContext(page) {
  const panelKey = String(page || 'dashboard').trim().toLowerCase();
  document.body.setAttribute('data-panel', panelKey);
  STATIC_DOM.view?.setAttribute('data-panel', panelKey);
}

// Reinicia el observador actual y avanza el token para invalidar animaciones viejas cuando cambiamos de panel.
function resetPanelMotion() {
  // Reinicia el observador actual y avanza el token para invalidar animaciones viejas cuando cambiamos de panel.
  if (PANEL_MOTION.observer) {
    PANEL_MOTION.observer.disconnect();
    PANEL_MOTION.observer = null;
  }
  PANEL_MOTION.token += 1;
}

// Recolecta los bloques visuales que deben animarse al entrar un panel sin depender de una sola estructura HTML.
function collectPanelMotionTargets(view) {
  // Recolecta los bloques visuales que deben animarse al entrar un panel sin depender de una sola estructura HTML.
  if (!view) return [];
  const selectors = [
    ':scope > *',
    ':scope > * > .cp',
    ':scope > * > .card',
    ':scope > * > section',
    '.dashboard-grid > *',
    '.settings-grid > *',
    '.settings-grid-profile > *',
    '.fr > .fg',
    '.kpi-grid > *',
    '.stats-grid > *',
    '.attendance-dashboard-grid > *',
  ];
  const seen = new Set();
  const targets = [];
  selectors.forEach((selector) => {
    view.querySelectorAll(selector).forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      if (seen.has(el)) return;
      if (el.classList.contains('ov')) return;
      if (el.id === 'toast-wrap') return;
      const area = (el.offsetWidth || 0) * (el.offsetHeight || 0);
      if (area < 6400) return;
      seen.add(el);
      targets.push(el);
    });
  });
  return targets.slice(0, 30);
}

// Aplica la animación escalonada de entrada a los bloques del panel recién renderizado.
function enhancePanelMotion(view) {
  // Aplica la animación escalonada de entrada a los bloques del panel recién renderizado.
  resetPanelMotion();
  if (!view) return;
  const targets = collectPanelMotionTargets(view);
  targets.forEach((el) => {
    el.classList.remove('ui-reveal', 'is-visible');
    el.style.removeProperty('--reveal-delay');
  });
  if (!targets.length || !canAnimateUiMotion()) return;
  const token = PANEL_MOTION.token;
  const motionFast = document.body.classList.contains('motion-fast');
  const delayStepMs = motionFast ? 20 : 32;
  const revealCap = motionFast ? 8 : 10;
  targets.forEach((el, index) => {
    el.classList.add('ui-reveal');
    el.style.setProperty('--reveal-delay', `${Math.min(index, revealCap) * delayStepMs}ms`);
  });
  if (typeof window.IntersectionObserver !== 'function') {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new window.IntersectionObserver((entries) => {
    if (token !== PANEL_MOTION.token) return;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    root: view,
    threshold: 0.12,
    rootMargin: '0px 0px -10% 0px',
  });
  PANEL_MOTION.observer = observer;
  targets.forEach((el) => observer.observe(el));
  window.requestAnimationFrame(() => {
    if (token !== PANEL_MOTION.token) return;
    targets.slice(0, 4).forEach((el) => el.classList.add('is-visible'));
  });
}
