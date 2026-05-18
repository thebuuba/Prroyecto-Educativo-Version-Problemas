import { S } from '../../../core/state.ts';
import { go } from '../../../core/routing.ts';
import { persist } from '../../../core/hydration.ts';
import { buildStudentAvatarDataUrl, toast } from '../../../core/domain-utils.ts';
import { delEst } from '../../../core/deleters.ts';
import {
  chooseStudentAddMode,
  openEstM,
  openEditStudent,
  openViewStudent,
  saveEditStudent,
  saveEst,
} from '../../../core/student-logic.ts';
import {
  openStudentSearchResult,
  setActiveSection,
  setStudentsGlobalSearch,
  setStudentsGradeView,
  setStudentsViewMode,
} from './actions.ts';
import {
  confirmSaveStudent,
  handleStudentCreatePhoto,
  updateStudentCreateField,
} from '../../crear-estudiante/utils/actions.ts';
import {
  confirmSaveEditStudent,
  handleStudentEditPhoto,
  updateStudentEditField,
} from '../../editar-estudiante/utils/actions.ts';

export function createStudent(sectionId = '', mode = ''): boolean {
  if (mode === 'panel') {
    go('student-create');
    return true;
  }
  void openEstM(sectionId || S.activeGroupId || '');
  return true;
}

export function editStudent(id = ''): boolean {
  if (!id) return false;
  void openEditStudent(id);
  return true;
}

export function deleteStudent(id = ''): boolean {
  if (!id) return false;
  void delEst(id);
  return true;
}

export async function saveStudent(mode = '', keepOpen = false): Promise<boolean> {
  if (mode === 'create') return (await confirmSaveStudent(keepOpen)) !== false;
  if (mode === 'edit-panel') return (await confirmSaveEditStudent()) !== false;
  if (mode === 'edit') {
    await saveEditStudent();
    return true;
  }
  await saveEst({ keepOpen });
  return true;
}

export function selectStudent(value = '', mode = ''): boolean {
  if (!value) return false;
  if (mode === 'view') {
    void openViewStudent(value);
    return true;
  }
  if (mode === 'search-result') {
    openStudentSearchResult(value);
    return true;
  }
  return false;
}

export function searchStudents(value = ''): boolean {
  setStudentsGlobalSearch(value);
  return true;
}

export function filterStudents(filter = '', value = ''): boolean {
  if (filter === 'grade') {
    setStudentsGradeView(value);
    return true;
  }
  if (filter === 'section') {
    setActiveSection(value);
    return true;
  }
  if (filter === 'view-mode') {
    setStudentsViewMode(value);
    return true;
  }
  return false;
}

export function clearStudentFilters(): boolean {
  setStudentsGlobalSearch('');
  return true;
}

export function chooseStudentMode(mode = ''): boolean {
  chooseStudentAddMode(mode);
  return true;
}

export function updateCreateStudentField(field = '', value = ''): boolean {
  if (!field) return false;
  return updateStudentCreateField(field, value) !== false;
}

export function updateEditStudentField(field = '', value = ''): boolean {
  if (!field) return false;
  return updateStudentEditField(field, value) !== false;
}

export function importCreateStudentPhoto(input?: HTMLInputElement): boolean {
  return handleStudentCreatePhoto(input) !== false;
}

export function importEditStudentPhoto(input?: HTMLInputElement): boolean {
  return handleStudentEditPhoto(input) !== false;
}

export function saveViewStudentPhoto(input?: HTMLInputElement): boolean {
  if (!input) return false;
  const id = String((document.getElementById('sv-id') as HTMLInputElement | null)?.value || '').trim();
  const student = S.estudiantes.find((item: any) => item.id === id);
  if (!student) return false;

  const file = input.files?.[0];
  if (!file) return false;

  const reader = new FileReader();
  reader.onload = (event) => {
    const photoUrl = String(event.target?.result || '');
    if (!photoUrl) return;
    student.photoUrl = photoUrl;
    const preview = document.getElementById('sv-photo') as HTMLImageElement | null;
    if (preview) preview.src = photoUrl;
    persist();
    toast('Foto actualizada');
  };
  reader.readAsDataURL(file);
  return true;
}

export function syncLegacyStudentPhoto(prefix = '', photoUrl = ''): boolean {
  const dataInput = document.getElementById(`${prefix}-photo-data`) as HTMLInputElement | null;
  if (dataInput) dataInput.value = photoUrl;
  const preview = document.getElementById(`${prefix}-photo-preview`) as HTMLImageElement | null;
  if (preview) {
    const fullName = [
      (document.getElementById(`${prefix}-nom`) as HTMLInputElement | null)?.value || '',
      (document.getElementById(`${prefix}-ape`) as HTMLInputElement | null)?.value || '',
    ].filter(Boolean).join(' ');
    preview.src = photoUrl || buildStudentAvatarDataUrl(fullName);
  }
  return true;
}

export function applyRememberedStudentSelection(value = ''): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized || !Array.isArray(S.studentDirectory)) return false;

  const match = S.studentDirectory.find((entry: any) => {
    const fullName = `${entry?.nombre || ''} ${entry?.apellido || ''}`.trim().toLowerCase();
    const matricula = String(entry?.matricula || '').toLowerCase();
    return fullName === normalized || matricula === normalized;
  });
  if (!match) return false;

  const setInputValue = (id: string, nextValue: string) => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    if (el) el.value = nextValue;
  };

  setInputValue('e-nom', String(match.nombre || ''));
  setInputValue('e-ape', String(match.apellido || ''));
  setInputValue('e-mat', String(match.matricula || ''));
  setInputValue('e-photo-data', String(match.photoUrl || ''));
  if (match.lastSectionId) setInputValue('e-sec', String(match.lastSectionId));
  syncLegacyStudentPhoto('e', String(match.photoUrl || ''));
  return true;
}

export function readStudentPhotoFile(input: HTMLInputElement, onLoad: (photoUrl: string) => void): boolean {
  const file = input.files?.[0];
  if (!file) {
    onLoad('');
    return false;
  }

  const reader = new FileReader();
  reader.onload = (event) => onLoad(String(event.target?.result || ''));
  reader.readAsDataURL(file);
  return true;
}
