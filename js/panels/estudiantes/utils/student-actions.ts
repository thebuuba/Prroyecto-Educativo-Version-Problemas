import { S } from '../../../core/state.ts';
import { closeM, forceCloseM } from '../../../core/ui.ts';
import { go } from '../../../core/routing.ts';
import {
  BULK_IMPORT_STATE,
  analyzeBulkInput,
  chooseStudentAddMode,
  handleBulkFileChange,
  openBulkEstM,
  openEditStudent,
  openViewStudent,
  saveBulkEst,
  saveEditStudent,
  saveEst,
} from '../../../core/student-logic.ts';
import { persist } from '../../../core/hydration.ts';
import { buildStudentAvatarDataUrl, toast } from '../../../core/domain-utils.ts';

type StudentActionContext = {
  trigger: HTMLElement;
  event: Event;
};

type StudentActionHandler = (context: StudentActionContext) => boolean | void | Promise<boolean | void>;

function data(trigger: HTMLElement, key: string): string {
  return String(trigger.dataset?.[key] || '').trim();
}

function valueFromTrigger(trigger: HTMLElement): string {
  if (trigger instanceof HTMLInputElement || trigger instanceof HTMLSelectElement || trigger instanceof HTMLTextAreaElement) {
    return trigger.value;
  }
  return data(trigger, 'studentValue') || data(trigger, 'value');
}

function callAllowedWindowFunction(name: string, ...args: unknown[]): void {
  const fn = (window as Record<string, unknown>)[name];
  if (typeof fn === 'function') {
    fn(...args);
    return;
  }
  console.warn(`[EduGest][student-actions] Acción legacy no disponible: ${name}`);
}

function currentStudentId(trigger: HTMLElement): string {
  return data(trigger, 'studentId') || String((document.getElementById('sv-id') as HTMLInputElement | null)?.value || '').trim();
}

function setInputValue(id: string, value: string): void {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  if (el) el.value = value;
}

function syncLegacyPhoto(prefix: string, photoUrl: string): void {
  setInputValue(`${prefix}-photo-data`, photoUrl);
  const preview = document.getElementById(`${prefix}-photo-preview`) as HTMLImageElement | null;
  if (preview) {
    const fullName = [
      (document.getElementById(`${prefix}-nom`) as HTMLInputElement | null)?.value || '',
      (document.getElementById(`${prefix}-ape`) as HTMLInputElement | null)?.value || '',
    ].filter(Boolean).join(' ');
    preview.src = photoUrl || buildStudentAvatarDataUrl(fullName);
  }
}

function readPhotoFile(input: HTMLInputElement, onLoad: (photoUrl: string) => void): void {
  const file = input.files?.[0];
  if (!file) {
    onLoad('');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => onLoad(String(event.target?.result || ''));
  reader.readAsDataURL(file);
}

function setBulkInputMode(mode: string): void {
  const nextMode = mode === 'file' ? 'file' : 'text';
  BULK_IMPORT_STATE.mode = nextMode;
  BULK_IMPORT_STATE.analyzed = false;

  const textWrap = document.getElementById('be-text-wrap');
  const fileWrap = document.getElementById('be-file-wrap');
  if (textWrap) textWrap.hidden = nextMode !== 'text';
  if (fileWrap) fileWrap.hidden = nextMode !== 'file';

  document.getElementById('be-mode-text')?.classList.toggle('btn-primary', nextMode === 'text');
  document.getElementById('be-mode-file')?.classList.toggle('btn-primary', nextMode === 'file');
}

function downloadTextFile(filename: string, content: string, type = 'text/csv;charset=utf-8'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadBulkTemplate(): void {
  downloadTextFile('plantilla-estudiantes.csv', 'matricula,nombre,apellido\n00-0001-1,Juan,Perez\n');
}

function downloadBulkErrorReport(): void {
  const rows = (BULK_IMPORT_STATE.entries || [])
    .filter((entry: any) => entry?.status && entry.status !== 'new')
    .map((entry: any) => `${entry.row || ''},${entry.matricula || ''},${entry.nombre || ''},${entry.status || ''}`)
    .join('\n');
  downloadTextFile('errores-carga-estudiantes.csv', `fila,matricula,nombre,estado\n${rows}\n`);
}

function applyRememberedStudentSelection(value: string): void {
  callAllowedWindowFunction('applyRememberedStudentSelection', value);

  const normalized = value.trim().toLowerCase();
  if (!normalized || !Array.isArray(S.studentDirectory)) return;

  const match = S.studentDirectory.find((entry: any) => {
    const fullName = `${entry?.nombre || ''} ${entry?.apellido || ''}`.trim().toLowerCase();
    const matricula = String(entry?.matricula || '').toLowerCase();
    return fullName === normalized || matricula === normalized;
  });
  if (!match) return;

  setInputValue('e-nom', String(match.nombre || ''));
  setInputValue('e-ape', String(match.apellido || ''));
  setInputValue('e-mat', String(match.matricula || ''));
  setInputValue('e-photo-data', String(match.photoUrl || ''));
  if (match.lastSectionId) setInputValue('e-sec', String(match.lastSectionId));
  syncLegacyPhoto('e', String(match.photoUrl || ''));
}

function saveViewPhoto(input: HTMLInputElement): void {
  const id = String((document.getElementById('sv-id') as HTMLInputElement | null)?.value || '').trim();
  const student = S.estudiantes.find((item: any) => item.id === id);
  if (!student) return;

  readPhotoFile(input, (photoUrl) => {
    if (!photoUrl) return;
    student.photoUrl = photoUrl;
    const preview = document.getElementById('sv-photo') as HTMLImageElement | null;
    if (preview) preview.src = photoUrl;
    persist();
    toast('Foto actualizada');
  });
}

const studentActionRegistry: Record<string, StudentActionHandler> = {
  create: ({ trigger }) => {
    if (data(trigger, 'studentMode') === 'panel') {
      go('student-create');
      return;
    }
    const sectionId = data(trigger, 'studentSectionId') || data(trigger, 'sectionId') || S.activeGroupId || '';
    callAllowedWindowFunction('openEstM', sectionId);
  },
  edit: ({ trigger }) => {
    const id = currentStudentId(trigger);
    if (id) openEditStudent(id);
  },
  delete: ({ trigger }) => {
    const id = currentStudentId(trigger);
    if (id) callAllowedWindowFunction('delEst', id);
  },
  save: ({ trigger }) => {
    const mode = data(trigger, 'studentMode');
    if (mode === 'create') {
      callAllowedWindowFunction('confirmSaveStudent', data(trigger, 'studentKeepOpen') === 'true');
      return;
    }
    if (mode === 'edit-panel') {
      callAllowedWindowFunction('confirmSaveEditStudent');
      return;
    }
    if (mode === 'edit') {
      saveEditStudent();
      return;
    }
    saveEst({ keepOpen: data(trigger, 'studentKeepOpen') === 'true' });
  },
  cancel: ({ trigger }) => {
    const modalId = data(trigger, 'modalClose') || data(trigger, 'modalId');
    if (modalId) closeM(modalId);
    else go(data(trigger, 'route') || 'estudiantes');
  },
  search: ({ trigger }) => {
    const searchMode = data(trigger, 'studentSearch');
    const value = valueFromTrigger(trigger);
    if (searchMode === 'remembered') {
      applyRememberedStudentSelection(value);
      return;
    }
    callAllowedWindowFunction('setStudentsGlobalSearch', value);
  },
  filter: ({ trigger }) => {
    const filter = data(trigger, 'studentFilter');
    const value = valueFromTrigger(trigger);
    if (filter === 'grade') callAllowedWindowFunction('setStudentsGradeView', value);
    if (filter === 'section') callAllowedWindowFunction('setActiveSection', value);
    if (filter === 'view-mode') callAllowedWindowFunction('setStudentsViewMode', value);
    if (filter === 'bulk-options' && BULK_IMPORT_STATE.analyzed) analyzeBulkInput();
  },
  'clear-filter': ({ trigger }) => {
    if (data(trigger, 'studentClear') === 'photo') {
      syncLegacyPhoto(data(trigger, 'studentPrefix'), '');
      return;
    }
    callAllowedWindowFunction('setStudentsGlobalSearch', '');
  },
  select: ({ trigger }) => {
    const select = data(trigger, 'studentSelect');
    const value = valueFromTrigger(trigger);
    const field = data(trigger, 'studentField');
    if (select === 'view' && value) openViewStudent(value);
    if (select === 'search-result' && value) callAllowedWindowFunction('openStudentSearchResult', value);
    if (select === 'create-field' && field) callAllowedWindowFunction('updateStudentCreateField', field, value);
    if (select === 'edit-field' && field) callAllowedWindowFunction('updateStudentEditField', field, value);
    if (select === 'add-mode') chooseStudentAddMode(value);
    if (select === 'file-picker') document.getElementById(data(trigger, 'studentTarget'))?.click();
    if (select === 'view-photo-picker') document.getElementById('sv-photo-file')?.click();
  },
  'bulk-upload': ({ trigger }) => {
    const sectionId = data(trigger, 'studentSectionId') || data(trigger, 'sectionId') || S.activeGroupId || '';
    forceCloseM('m-est');
    openBulkEstM(sectionId);
  },
  'bulk-preview': () => {
    analyzeBulkInput();
  },
  'bulk-confirm': () => {
    saveBulkEst();
  },
  'bulk-cancel': () => {
    closeM('m-est-bulk');
  },
  export: ({ trigger }) => {
    const kind = data(trigger, 'studentExport');
    if (kind === 'errors') downloadBulkErrorReport();
    else downloadBulkTemplate();
  },
  import: ({ trigger }) => {
    if (data(trigger, 'studentImport') === 'bulk-mode') {
      setBulkInputMode(valueFromTrigger(trigger));
      return;
    }
    if (data(trigger, 'studentImport') === 'bulk-file' && trigger instanceof HTMLInputElement) {
      handleBulkFileChange(trigger);
      return;
    }
    if (data(trigger, 'studentImport') === 'photo-create' && trigger instanceof HTMLInputElement) {
      callAllowedWindowFunction('handleStudentCreatePhoto', trigger);
      return;
    }
    if (data(trigger, 'studentImport') === 'photo-edit' && trigger instanceof HTMLInputElement) {
      callAllowedWindowFunction('handleStudentEditPhoto', trigger);
      return;
    }
    if (data(trigger, 'studentImport') === 'photo-view' && trigger instanceof HTMLInputElement) {
      saveViewPhoto(trigger);
      return;
    }
    if (data(trigger, 'studentImport') === 'photo-legacy' && trigger instanceof HTMLInputElement) {
      const prefix = data(trigger, 'studentPrefix');
      readPhotoFile(trigger, (photoUrl) => syncLegacyPhoto(prefix, photoUrl));
    }
  },
};

export function handleDeclarativeStudentAction(trigger: Element, event: Event): boolean {
  if (!(trigger instanceof HTMLElement)) return false;
  const action = data(trigger, 'studentAction');
  const handler = studentActionRegistry[action];
  if (!handler) {
    console.warn('[EduGest][student-actions] Acción no permitida.', { action });
    return false;
  }

  const expectedEvent = data(trigger, 'studentEvent');
  if (expectedEvent && expectedEvent !== event.type) return false;

  if (event.type === 'click' || event.type === 'dblclick') {
    event.preventDefault();
    event.stopPropagation();
  }

  void handler({ trigger, event });
  return true;
}
