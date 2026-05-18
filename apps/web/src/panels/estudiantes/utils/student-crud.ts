import { S } from '../../../../../../js/core/state.ts';
import { go } from '../../../../../../js/core/routing.ts';
import {
  chooseStudentAddMode,
  openStudentAddModeModal,
  registerStudentSilently,
  upsertStudentDirectoryEntry,
} from '../../../../../../js/core/student-logic.ts';
import { deleteStudentById } from './student-delete.ts';
import { findStudentById } from './student-helpers.ts';
import {
  openStudentCreateModal,
  openStudentEditModal,
  openStudentViewModal,
  saveStudentCreateModal,
  saveStudentEditModal,
} from './student-modals.ts';

type StudentRecordInput = {
  nombre?: string;
  apellido?: string;
  sectionId?: string | null;
};

export function getStudentById(id = '') {
  return findStudentById(S.estudiantes, id);
}

export async function createStudentRecord(input: StudentRecordInput = {}): Promise<unknown> {
  return registerStudentSilently(input.nombre || '', input.apellido || '', input.sectionId || null);
}

export async function updateStudentRecord(): Promise<boolean> {
  return saveStudentEditModal();
}

export async function deleteStudentRecord(id = ''): Promise<boolean> {
  return deleteStudentById(id);
}

export async function saveStudentFromModal(options: Record<string, unknown> = {}): Promise<boolean> {
  return saveStudentCreateModal(options);
}

export async function saveEditedStudentFromModal(): Promise<boolean> {
  return saveStudentEditModal();
}

export async function openStudentForEdit(id = ''): Promise<boolean> {
  return openStudentEditModal(id);
}

export async function openStudentForView(id = ''): Promise<boolean> {
  return openStudentViewModal(id);
}

export function openStudentCreatePanel(id = ''): boolean {
  if (id) S.activeGroupId = id;
  go('student-create');
  return true;
}

export function chooseStudentCreationMode(mode = ''): boolean {
  chooseStudentAddMode(mode);
  return true;
}

export function openStudentAddMode(): boolean {
  openStudentAddModeModal();
  return true;
}

export { upsertStudentDirectoryEntry };
export {
  openStudentCreateModal,
  openStudentEditModal,
  openStudentViewModal,
  saveStudentCreateModal,
  saveStudentEditModal,
} from './student-modals.ts';
