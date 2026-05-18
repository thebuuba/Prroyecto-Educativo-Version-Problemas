import { S } from '../../../../../../js/core/state.ts';
import { closeM } from '../../../../../../js/core/ui.ts';
import {
  cancelBulkUpload,
  confirmBulkStudents,
  exportBulkErrorReport,
  exportStudentTemplate,
  importStudents,
  isBulkAnalyzed,
  openBulkUpload,
  previewBulkStudents,
  setBulkInputMode,
} from './student-bulk.ts';
import {
  applyRememberedStudentSelection,
  chooseStudentMode,
  clearStudentFilters,
  createStudent,
  deleteStudent,
  editStudent,
  filterStudents,
  importCreateStudentPhoto,
  importEditStudentPhoto,
  readStudentPhotoFile,
  saveStudent,
  saveViewStudentPhoto,
  searchStudents,
  selectStudent,
  syncLegacyStudentPhoto,
  updateCreateStudentField,
  updateEditStudentField,
} from './student-domain-actions.ts';

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

const studentActionRegistry: Record<string, StudentActionHandler> = {
  create: ({ trigger }) => {
    const sectionId = data(trigger, 'studentSectionId') || data(trigger, 'sectionId') || S.activeGroupId || '';
    createStudent(sectionId, data(trigger, 'studentMode'));
  },
  edit: ({ trigger }) => {
    const id = currentStudentId(trigger);
    if (id) editStudent(id);
  },
  delete: ({ trigger }) => {
    const id = currentStudentId(trigger);
    if (id) deleteStudent(id);
  },
  save: ({ trigger }) => {
    const mode = data(trigger, 'studentMode');
    const keepOpen = data(trigger, 'studentKeepOpen') === 'true';
    void saveStudent(mode, keepOpen).then((ok) => {
      if (ok) return;
      if (mode === 'create') callAllowedWindowFunction('confirmSaveStudent', keepOpen);
      if (mode === 'edit-panel') callAllowedWindowFunction('confirmSaveEditStudent');
    });
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
      if (!applyRememberedStudentSelection(value)) callAllowedWindowFunction('applyRememberedStudentSelection', value);
      return;
    }
    searchStudents(value);
  },
  filter: ({ trigger }) => {
    const filter = data(trigger, 'studentFilter');
    const value = valueFromTrigger(trigger);
    if (filter === 'grade') filterStudents(filter, value);
    if (filter === 'section') filterStudents(filter, value);
    if (filter === 'view-mode') filterStudents(filter, value);
    if (filter === 'bulk-options' && isBulkAnalyzed()) void previewBulkStudents();
  },
  'clear-filter': ({ trigger }) => {
    if (data(trigger, 'studentClear') === 'photo') {
      syncLegacyStudentPhoto(data(trigger, 'studentPrefix'), '');
      return;
    }
    clearStudentFilters();
  },
  select: ({ trigger }) => {
    const select = data(trigger, 'studentSelect');
    const value = valueFromTrigger(trigger);
    const field = data(trigger, 'studentField');
    if (select === 'view' && value) selectStudent(value, 'view');
    if (select === 'search-result' && value && !selectStudent(value, 'search-result')) callAllowedWindowFunction('openStudentSearchResult', value);
    if (select === 'create-field' && field && !updateCreateStudentField(field, value)) callAllowedWindowFunction('updateStudentCreateField', field, value);
    if (select === 'edit-field' && field && !updateEditStudentField(field, value)) callAllowedWindowFunction('updateStudentEditField', field, value);
    if (select === 'add-mode') chooseStudentMode(value);
    if (select === 'file-picker') document.getElementById(data(trigger, 'studentTarget'))?.click();
    if (select === 'view-photo-picker') document.getElementById('sv-photo-file')?.click();
  },
  'bulk-upload': ({ trigger }) => {
    const sectionId = data(trigger, 'studentSectionId') || data(trigger, 'sectionId') || S.activeGroupId || '';
    void openBulkUpload(sectionId);
  },
  'bulk-preview': () => {
    void previewBulkStudents();
  },
  'bulk-confirm': () => {
    void confirmBulkStudents();
  },
  'bulk-cancel': () => {
    cancelBulkUpload();
  },
  export: ({ trigger }) => {
    const kind = data(trigger, 'studentExport');
    if (kind === 'errors') exportBulkErrorReport();
    else exportStudentTemplate();
  },
  import: ({ trigger }) => {
    if (data(trigger, 'studentImport') === 'bulk-mode') {
      setBulkInputMode(valueFromTrigger(trigger));
      return;
    }
    if (data(trigger, 'studentImport') === 'bulk-file' && trigger instanceof HTMLInputElement) {
      importStudents(trigger);
      return;
    }
    if (data(trigger, 'studentImport') === 'photo-create' && trigger instanceof HTMLInputElement) {
      if (!importCreateStudentPhoto(trigger)) callAllowedWindowFunction('handleStudentCreatePhoto', trigger);
      return;
    }
    if (data(trigger, 'studentImport') === 'photo-edit' && trigger instanceof HTMLInputElement) {
      if (!importEditStudentPhoto(trigger)) callAllowedWindowFunction('handleStudentEditPhoto', trigger);
      return;
    }
    if (data(trigger, 'studentImport') === 'photo-view' && trigger instanceof HTMLInputElement) {
      saveViewStudentPhoto(trigger);
      return;
    }
    if (data(trigger, 'studentImport') === 'photo-legacy' && trigger instanceof HTMLInputElement) {
      const prefix = data(trigger, 'studentPrefix');
      readStudentPhotoFile(trigger, (photoUrl) => syncLegacyStudentPhoto(prefix, photoUrl));
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
