import { S } from '../../../../../../js/core/state.ts';
import { persist } from '../../../../../../js/core/hydration.ts';
import { go } from '../../../../../../js/core/routing.ts';
import { closeM, openM } from '../../../../../../js/core/ui.ts';
import { escapeHtml, findActivity } from '../../../../../../js/core/domain-utils.ts';
import { BASIC_INSTRUMENT_TYPES, INSTRUMENT_META } from '../view.ts';

const LINK_ACTIVITY_KEY = '_linkActId';

function setLinkActivityId(activityId: string): void {
  (window as Record<string, unknown>)[LINK_ACTIVITY_KEY] = activityId;
}

function getLinkActivityId(): string {
  return String((window as Record<string, unknown>)[LINK_ACTIVITY_KEY] || '').trim();
}

function setText(id: string, value: string): void {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function selectedInstrumentId(): string {
  const select = document.getElementById('li-inst') as HTMLSelectElement | null;
  return String(select?.value || '').trim();
}

function optionLabel(inst: any): string {
  const meta = INSTRUMENT_META[inst?.type] || { title: 'Instrumento' };
  return `${inst?.name || meta.title} · ${meta.title}`;
}

function availableInstruments(): any[] {
  const activeGroupId = String(S.activeGroupId || '').trim();
  const activePeriodId = String(S.activePeriodId || '').trim();
  return (S.instruments || []).filter((inst: any) => {
    const courseId = String(inst?.courseId || '').trim();
    const periodId = String(inst?.periodId || '').trim();
    return (!courseId || !activeGroupId || courseId === activeGroupId)
      && (!periodId || !activePeriodId || periodId === activePeriodId);
  });
}

function populateLinkModal(activityId: string): boolean {
  const found = findActivity(activityId);
  const activity = found?.activity;
  const select = document.getElementById('li-inst') as HTMLSelectElement | null;
  if (!activity || !select) return false;

  setText('li-act', activity.name || '');
  select.innerHTML = '';
  const instruments = availableInstruments();
  instruments.forEach((inst: any) => {
    const option = new Option(optionLabel(inst), String(inst.id || ''));
    select.add(option);
  });
  if (activity.instrumentId) select.value = String(activity.instrumentId);

  const createButton = document.getElementById('li-create-btn') as HTMLElement | null;
  if (createButton) createButton.dataset.activityId = activityId;
  return true;
}

function populateTypePicker(activityId: string): boolean {
  const grid = document.getElementById('inst-type-grid');
  if (!grid) return false;
  grid.innerHTML = BASIC_INSTRUMENT_TYPES.map((type) => {
    const meta = INSTRUMENT_META[type];
    return `
      <button type="button" class="instrument-type-card" data-activity-action="create-instrument" data-value="${escapeHtml(type)}" data-activity-id="${escapeHtml(activityId)}">
        <strong>${escapeHtml(meta.title)}</strong>
        <span>${escapeHtml(meta.desc)}</span>
      </button>
    `;
  }).join('');
  return true;
}

function retryPopulate(action: () => boolean, attempts = 8): void {
  if (action()) return;
  if (attempts <= 0) return;
  window.setTimeout(() => retryPopulate(action, attempts - 1), 25);
}

export function openApplyInstrumentModal(activityId: string, studentId?: string): boolean {
  const nextActivityId = String(activityId || '').trim();
  if (!nextActivityId || !findActivity(nextActivityId)) return false;
  setLinkActivityId(nextActivityId);
  if (studentId) {
    (window as Record<string, unknown>)._linkStudentId = studentId;
  }
  openM('m-link-inst');
  retryPopulate(() => populateLinkModal(nextActivityId));
  return true;
}

export function openCreateInstrumentTypePicker(activityId: string): boolean {
  const nextActivityId = String(activityId || getLinkActivityId()).trim();
  if (!nextActivityId || !findActivity(nextActivityId)) return false;
  setLinkActivityId(nextActivityId);
  openM('m-inst-type');
  retryPopulate(() => populateTypePicker(nextActivityId));
  return true;
}

export function confirmLinkInstrument(): boolean {
  const activityId = getLinkActivityId();
  const instrumentId = selectedInstrumentId();
  if (!activityId || !instrumentId) return false;

  const found = findActivity(activityId);
  if (!found?.activity) return false;

  const activity = found.activity;
  activity.instrumentId = instrumentId;
  const instrumentIds = Array.isArray(activity.instrumentIds) ? activity.instrumentIds : [];
  activity.instrumentIds = Array.from(new Set([...instrumentIds, instrumentId]));
  activity.instrumentHistory = Array.isArray(activity.instrumentHistory) ? activity.instrumentHistory : [];
  activity.instrumentHistory.push({
    instrumentId,
    linkedAt: new Date().toISOString(),
  });

  persist();
  closeM('m-link-inst');
  go('actividades');
  return true;
}
