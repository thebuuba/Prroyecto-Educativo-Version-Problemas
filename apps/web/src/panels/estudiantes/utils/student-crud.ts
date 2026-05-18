import { S } from '../../../../../../js/core/state.ts';
import { go } from '../../../../../../js/core/routing.ts';
import {
  chooseStudentAddMode,
  openEstM,
  openStudentAddModeModal,
  openEditStudent,
  openViewStudent,
  registerStudentSilently,
  saveEditStudent,
  saveEst,
  upsertStudentDirectoryEntry,
} from '../../../../../../js/core/student-logic.ts';
import { deleteStudentById } from './student-delete.ts';
import { findStudentById } from './student-helpers.ts';

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
  await saveEditStudent();
  return true;
}

export async function deleteStudentRecord(id = ''): Promise<boolean> {
  return deleteStudentById(id);
}

export async function saveStudentFromModal(options: Record<string, unknown> = {}): Promise<boolean> {
  await saveEst(options);
  return true;
}

export async function saveEditedStudentFromModal(): Promise<boolean> {
  await saveEditStudent();
  return true;
}

export async function openStudentForEdit(id = ''): Promise<boolean> {
  if (!id) return false;
  await openEditStudent(id);
  return true;
}

export async function openStudentForView(id = ''): Promise<boolean> {
  if (!id) return false;
  await openViewStudent(id);
  return true;
}

export async function openStudentCreateModal(sectionId = ''): Promise<boolean> {
  await openEstM(sectionId || S.activeGroupId || '');
  return true;
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
