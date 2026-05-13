type ModalRegistry = Map<string, string>;

const modalRegistry: ModalRegistry = new Map();
const modalHtmlCache = new Map<string, string>();
const pendingModalLoads = new Map<string, Promise<HTMLElement | null>>();

function getModalRoot(): HTMLElement {
  let root = document.getElementById('modal-fragments-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'modal-fragments-root';
    document.body.appendChild(root);
  }
  return root;
}

export function registerModal(id: string, url: string): void {
  const cleanId = String(id || '').trim();
  const cleanUrl = String(url || '').trim();
  if (!cleanId || !cleanUrl) return;
  modalRegistry.set(cleanId, cleanUrl);
}

export async function ensureModalLoaded(id: string): Promise<HTMLElement | null> {
  const cleanId = String(id || '').trim();
  if (!cleanId) return null;

  const existing = document.getElementById(cleanId);
  if (existing) return existing;

  if (pendingModalLoads.has(cleanId)) return pendingModalLoads.get(cleanId) || null;

  const url = modalRegistry.get(cleanId);
  if (!url) return null;

  const loadPromise = (async () => {
    let html = modalHtmlCache.get(cleanId);
    if (!html) {
      const response = await fetch(url, { credentials: 'same-origin' });
      if (!response.ok) {
        throw new Error(`No se pudo cargar el modal ${cleanId}: ${response.status}`);
      }
      html = await response.text();
      modalHtmlCache.set(cleanId, html);
    }

    getModalRoot().insertAdjacentHTML('beforeend', html);
    return document.getElementById(cleanId);
  })().finally(() => {
    pendingModalLoads.delete(cleanId);
  });

  pendingModalLoads.set(cleanId, loadPromise);
  return loadPromise;
}

export function registerDefaultModals(): void {
  [
    'm-setup',
    'm-grade',
    'm-sec',
    'm-student-add-mode',
    'm-est',
    'm-est-bulk',
    'm-est-edit',
    'm-est-view',
    'm-grade-edit',
    'm-sec-edit',
    'm-act',
    'm-tpl',
    'm-usr',
    'm-link-inst',
    'm-inst-type',
    'm-lesson-plan-section',
    'm-inst-editor',
    'm-apply-inst',
    'm-schedule-base',
    'm-schedule-wizard',
    'm-schedule-cell',
    'm-schedule-row-copy',
    'm-schedule-row-adjust',
  ].forEach((id) => registerModal(id, `/sections/modals/${id}.html`));
}
