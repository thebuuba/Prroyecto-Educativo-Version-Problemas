import { delEst } from '../../../../../../js/core/deleters.ts';

function currentViewStudentId(): string {
  return String((document.getElementById('sv-id') as HTMLInputElement | null)?.value || '').trim();
}

export async function deleteStudentById(id = ''): Promise<boolean> {
  if (!id) return false;
  await delEst(id);
  return true;
}

export async function deleteSelectedStudent(id = ''): Promise<boolean> {
  return deleteStudentById(id || currentViewStudentId());
}

export async function confirmDeleteStudent(id = ''): Promise<boolean> {
  return deleteStudentById(id);
}
