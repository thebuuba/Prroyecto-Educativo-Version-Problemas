import { S } from '../../../../../../js/core/state.ts';
import {
  openEditStudent,
  openEstM,
  openViewStudent,
  saveEditStudent,
  saveEst,
} from '../../../../../../js/core/student-logic.ts';

export async function openStudentCreateModal(sectionId = ''): Promise<boolean> {
  await openEstM(sectionId || S.activeGroupId || '');
  return true;
}

export async function saveStudentCreateModal(options: Record<string, unknown> = {}): Promise<boolean> {
  await saveEst(options);
  return true;
}

export async function openStudentViewModal(studentId = ''): Promise<boolean> {
  if (!studentId) return false;
  await openViewStudent(studentId);
  return true;
}

export async function openStudentEditModal(studentId = ''): Promise<boolean> {
  if (!studentId) return false;
  await openEditStudent(studentId);
  return true;
}

export async function saveStudentEditModal(): Promise<boolean> {
  await saveEditStudent();
  return true;
}
