import { S } from '../../../core/state.ts';
import { go } from '../../../core/routing.ts';
import { closeM } from '../../../core/ui.ts';
import {
  escapeHtml,
  normalizeEducationLevelName,
  parseGradeLevel,
  persist,
  toast,
} from '../../../core/domain-utils.ts';
import { saveGrade } from '../../../core/grade-logic.ts';
import { saveEditSection, saveSec } from '../../../core/section-logic.ts';

type AcademicActionContext = {
  trigger: HTMLElement;
  event: Event;
};

type AcademicActionHandler = (context: AcademicActionContext) => boolean | void | Promise<boolean | void>;

const AREA_SUBJECTS: Record<string, Array<{ area: string; subjects: string[] }>> = {
  Inicial: [
    { area: 'Desarrollo Personal y Social', subjects: ['Identidad', 'Autonomía', 'Convivencia'] },
    { area: 'Comunicación', subjects: ['Lengua Oral y Escrita', 'Expresión Artística'] },
    { area: 'Pensamiento Lógico', subjects: ['Relación con el Entorno', 'Pensamiento Matemático'] },
  ],
  Primaria: [
    { area: 'Lengua Española', subjects: ['Lengua Española'] },
    { area: 'Matemática', subjects: ['Matemática'] },
    { area: 'Ciencias Sociales', subjects: ['Ciencias Sociales'] },
    { area: 'Ciencias de la Naturaleza', subjects: ['Ciencias de la Naturaleza'] },
    { area: 'Educación Artística', subjects: ['Educación Artística'] },
    { area: 'Educación Física', subjects: ['Educación Física'] },
    { area: 'Formación Integral Humana y Religiosa', subjects: ['Formación Integral Humana y Religiosa'] },
    { area: 'Lenguas Extranjeras', subjects: ['Inglés', 'Francés'] },
  ],
  Secundaria: [
    { area: 'Lengua Española', subjects: ['Lengua Española', 'Lengua y Literatura'] },
    { area: 'Matemática', subjects: ['Matemática'] },
    { area: 'Ciencias Sociales', subjects: ['Ciencias Sociales', 'Historia', 'Geografía', 'Educación Moral y Cívica', 'Historia y Geografía'] },
    { area: 'Ciencias de la Naturaleza', subjects: ['Ciencias de la Naturaleza', 'Biología', 'Química', 'Física'] },
    { area: 'Educación Artística', subjects: ['Educación Artística'] },
    { area: 'Educación Física', subjects: ['Educación Física'] },
    { area: 'Formación Integral Humana y Religiosa', subjects: ['Formación Integral Humana y Religiosa'] },
    { area: 'Lenguas Extranjeras', subjects: ['Inglés', 'Francés'] },
    { area: 'Informática', subjects: ['Informática'] },
  ],
};

function data(trigger: HTMLElement, key: string): string {
  return String(trigger.dataset?.[key] || '').trim();
}

function valueFromTrigger(trigger: HTMLElement): string {
  if (trigger instanceof HTMLInputElement || trigger instanceof HTMLSelectElement || trigger instanceof HTMLTextAreaElement) {
    return trigger.value;
  }
  return data(trigger, 'academicValue') || data(trigger, 'value');
}

function callAllowedWindowFunction(name: string, ...args: unknown[]): boolean {
  const fn = (window as Record<string, unknown>)[name];
  if (typeof fn !== 'function') return false;
  fn(...args);
  return true;
}

function setValue(id: string, value: string): void {
  const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  if (element) element.value = value;
}

function getValue(id: string): string {
  const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  return String(element?.value || '').trim();
}

function areasForLevel(level: string): Array<{ area: string; subjects: string[] }> {
  return AREA_SUBJECTS[normalizeEducationLevelName(level)] || AREA_SUBJECTS.Primaria;
}

function subjectsForArea(level: string, area: string): string[] {
  return areasForLevel(level).find((item) => item.area === area)?.subjects || [];
}

function fillOptions(id: string, values: string[], selected = ''): void {
  const select = document.getElementById(id) as HTMLSelectElement | null;
  if (!select) return;
  select.innerHTML = values
    .map((value) => `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(value)}</option>`)
    .join('');
  if (selected) select.value = selected;
}

function gradeOptionsForLevel(level: string): string[] {
  const normalizedLevel = normalizeEducationLevelName(level);
  if (normalizedLevel === 'Inicial') return ['Parvulario', 'Pre-Kínder', 'Kínder', 'Pre-Primario'];
  return ['1ero', '2do', '3ero', '4to', '5to', '6to'];
}

function refreshGradeForm(resetDependent = false): void {
  const level = getValue('gr-edu-level') || 'Primaria';
  const gradeSelect = document.getElementById('gr-grade-num') as HTMLSelectElement | null;
  const currentGrade = getValue('gr-grade-num');
  if (gradeSelect) {
    gradeSelect.innerHTML = `<option value="">Selecciona un grado</option>${gradeOptionsForLevel(level)
      .map((grade) => `<option value="${escapeHtml(grade)}" ${grade === currentGrade ? 'selected' : ''}>${escapeHtml(grade)}</option>`)
      .join('')}`;
  }

  const currentArea = getValue('gr-area');
  fillOptions('gr-section', ['A', 'B', 'C', 'D'], getValue('gr-section') || 'A');
  fillOptions('gr-area', areasForLevel(level).map((item) => item.area), currentArea);
  refreshGradeSubjects();
}

function refreshGradeSubjects(): void {
  const level = getValue('gr-edu-level') || 'Primaria';
  const area = getValue('gr-area');
  const subjects = subjectsForArea(level, area);
  fillOptions('gr-subject', subjects, subjects.includes(getValue('gr-subject')) ? getValue('gr-subject') : subjects[0] || '');
}

function refreshSectionForm(prefix: string, resetSubject = false): void {
  const gradeId = getValue(prefix === 'es' ? 'es-gid' : 'sec-g');
  const grade = (S.grades || []).find((item: any) => item.id === gradeId);
  const level = normalizeEducationLevelName(grade?.educationLevel || 'Primaria');
  const areaId = prefix === 'es' ? 'es-area' : 'sec-area';
  const subjectId = prefix === 'es' ? 'es-mat' : 'sec-m';
  const selectedArea = resetSubject ? '' : getValue(areaId);

  fillOptions(areaId, areasForLevel(level).map((item) => item.area), selectedArea);
  const subjects = subjectsForArea(level, getValue(areaId));
  fillOptions(subjectId, subjects, resetSubject ? subjects[0] || '' : getValue(subjectId));
}

function promptAppendOption(selectId: string, message: string): void {
  const value = window.prompt(message)?.trim();
  if (!value) return;
  const select = document.getElementById(selectId) as HTMLSelectElement | null;
  if (!select) return;
  if (![...select.options].some((option) => option.value === value)) {
    select.add(new Option(value, value));
  }
  select.value = value;
}

async function saveEditGradeFallback(): Promise<void> {
  if (callAllowedWindowFunction('saveEditGrade')) return;

  const id = getValue('eg-id');
  const grade = (S.grades || []).find((item: any) => item.id === id);
  if (!grade) return;

  const name = getValue('eg-grade-num');
  const educationLevel = normalizeEducationLevelName(getValue('eg-edu-level'));
  if (!name || !educationLevel) {
    toast('Completa todos los campos', true);
    return;
  }

  grade.name = name;
  grade.gradeLevel = parseGradeLevel(name);
  grade.educationLevel = educationLevel;

  (S.secciones || []).forEach((section: any) => {
    if (section.gradeId === id) {
      section.grado = name;
      section.gradeLevel = grade.gradeLevel;
    }
  });

  persist({ immediate: true });
  closeM('m-grade-edit');
  go('estudiantes');
  toast('Grado actualizado');
}

function updateModernField(domain: string, field: string, value: string): void {
  if (domain === 'grade') {
    callAllowedWindowFunction('updateGradeSetupField', field, value);
    return;
  }
  if (domain === 'section') {
    callAllowedWindowFunction('updateSectionCreateField', field, value);
  }
}

const academicActionRegistry: Record<string, AcademicActionHandler> = {
  'create-grade': () => {
    go('grade-setup');
  },
  'edit-grade': ({ trigger }) => {
    callAllowedWindowFunction('openEditGrade', data(trigger, 'academicId'));
  },
  'delete-grade': ({ trigger }) => {
    callAllowedWindowFunction('delGrade', data(trigger, 'academicId'));
  },
  'save-grade': ({ trigger }) => {
    if (data(trigger, 'academicMode') === 'modern') {
      callAllowedWindowFunction('confirmSaveGrade');
      return;
    }
    if (data(trigger, 'academicMode') === 'edit') {
      void saveEditGradeFallback();
      return;
    }
    void saveGrade();
  },
  'create-section': ({ trigger }) => {
    const gradeId = data(trigger, 'academicGradeId') || S.activeGradeId || '';
    callAllowedWindowFunction('openSecM', gradeId);
  },
  'edit-section': ({ trigger }) => {
    callAllowedWindowFunction('openEditSection', data(trigger, 'academicId'));
  },
  'delete-section': ({ trigger }) => {
    callAllowedWindowFunction('delSec', data(trigger, 'academicId'));
  },
  'save-section': ({ trigger }) => {
    if (data(trigger, 'academicMode') === 'modern') {
      callAllowedWindowFunction('confirmSaveSection');
      return;
    }
    if (data(trigger, 'academicMode') === 'edit') {
      void saveEditSection();
      return;
    }
    void saveSec();
  },
  'select-grade': ({ trigger }) => {
    const field = data(trigger, 'academicField');
    const value = valueFromTrigger(trigger);
    const domain = data(trigger, 'academicDomain');
    if (field && domain) {
      updateModernField(domain, field, value);
      return;
    }

    if (field === 'level') {
      setValue('gr-grade-num', '');
      setValue('gr-area', '');
      setValue('gr-subject', '');
      refreshGradeForm(true);
      return;
    }
    if (field === 'grade') refreshGradeForm(false);
  },
  'select-section': ({ trigger }) => {
    const field = data(trigger, 'academicField');
    const domain = data(trigger, 'academicDomain');
    if (field && domain) {
      updateModernField(domain, field, valueFromTrigger(trigger));
      return;
    }
    refreshSectionForm(data(trigger, 'academicPrefix') || 'sec', true);
  },
  filter: ({ trigger }) => {
    const target = data(trigger, 'academicTarget');
    if (target === 'grade-curriculum') refreshGradeForm(data(trigger, 'academicReset') === 'true');
    if (target === 'grade-subjects') refreshGradeSubjects();
    if (target === 'section-curriculum') refreshSectionForm(data(trigger, 'academicPrefix') || 'sec', data(trigger, 'academicReset') === 'true');
  },
  'clear-filter': ({ trigger }) => {
    const target = data(trigger, 'academicTarget');
    if (target === 'section') promptAppendOption(data(trigger, 'academicSelectId') || 'gr-section', 'Nueva sección');
    if (target === 'area') promptAppendOption(data(trigger, 'academicSelectId') || 'gr-area', 'Nueva área');
    if (target === 'subject') promptAppendOption(data(trigger, 'academicSelectId') || 'gr-subject', 'Nueva asignatura');
  },
  cancel: ({ trigger }) => {
    const modalId = data(trigger, 'modalClose') || data(trigger, 'modalId');
    if (modalId) closeM(modalId);
    else go(data(trigger, 'route') || 'estudiantes');
  },
};

export function handleDeclarativeAcademicAction(trigger: Element, event: Event): boolean {
  if (!(trigger instanceof HTMLElement)) return false;
  const action = data(trigger, 'academicAction');
  const handler = academicActionRegistry[action];
  if (!handler) {
    console.warn('[EduGest][academic-actions] Acción no permitida.', { action });
    return false;
  }

  if (event.type === 'click') {
    event.preventDefault();
    event.stopPropagation();
  }

  void handler({ trigger, event });
  return true;
}
