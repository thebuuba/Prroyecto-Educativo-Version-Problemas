import { go } from '../../../../../../js/core/routing.ts';
import { reportDownloadExcel, reportDownloadPdf, reportDownloadWord } from './actions.ts';

type ReportActionContext = {
  trigger: HTMLElement;
  event: Event;
};

type ReportActionHandler = (context: ReportActionContext) => boolean | void | Promise<boolean | void>;

function data(trigger: HTMLElement, key: string): string {
  return String(trigger.dataset?.[key] || '').trim();
}

function valueFromTrigger(trigger: HTMLElement): string {
  if (trigger instanceof HTMLInputElement || trigger instanceof HTMLSelectElement || trigger instanceof HTMLTextAreaElement) {
    return trigger.value;
  }
  return data(trigger, 'reportValue') || data(trigger, 'value');
}

function exportReport(format: string): void {
  if (format === 'pdf') {
    void reportDownloadPdf();
    return;
  }
  if (format === 'excel' || format === 'xls') {
    reportDownloadExcel();
    return;
  }
  if (format === 'word' || format === 'doc') {
    reportDownloadWord();
  }
}

const reportActionRegistry: Record<string, ReportActionHandler> = {
  generate: () => go('reportes'),
  view: () => go('reportes'),
  print: () => window.print(),
  export: ({ trigger }) => exportReport(data(trigger, 'format') || valueFromTrigger(trigger)),
  'export-pdf': () => exportReport('pdf'),
  'export-excel': () => exportReport('excel'),
  filter: () => {},
  'clear-filter': () => {},
  'select-type': () => {},
  'select-grade': () => {},
  'select-section': () => {},
  'select-subject': () => {},
  'select-period': () => {},
  refresh: () => go('reportes'),
  download: ({ trigger }) => exportReport(data(trigger, 'format') || valueFromTrigger(trigger)),
  'open-detail': () => {},
  'export-word': () => exportReport('word'),
};

export function handleDeclarativeReportAction(trigger: Element, event: Event): boolean {
  if (!(trigger instanceof HTMLElement)) return false;
  const action = data(trigger, 'reportAction');
  const handler = reportActionRegistry[action];
  if (!handler) {
    console.warn('[EduGest][report-actions] Acción no permitida.', { action });
    return false;
  }

  const expectedEvent = data(trigger, 'reportEvent');
  if (expectedEvent && expectedEvent !== event.type) return false;

  if (event.type === 'click') {
    event.preventDefault();
    event.stopPropagation();
  }

  void handler({ trigger, event });
  return true;
}
