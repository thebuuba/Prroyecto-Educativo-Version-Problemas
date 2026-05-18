import {
  formatMatricula,
  normalizeMatricula,
  normTxt,
} from '../../../../../../js/core/domain-utils.ts';

type StudentLike = Record<string, any>;

export function normalizeStudentText(value: unknown): string {
  return String(value || '').trim();
}

export function normalizeStudentMatricula(value: unknown): string {
  return formatMatricula(String(value || ''));
}

export function findStudentById(students: StudentLike[] = [], id = ''): StudentLike | null {
  if (!id || !Array.isArray(students)) return null;
  return students.find((student) => student?.id === id) || null;
}

export function studentMatriculaExists(students: StudentLike[] = [], mat = '', excludeId: string | null = null): boolean {
  const key = normalizeMatricula(mat);
  return (students || []).some((student) => student?.id !== excludeId && normalizeMatricula(student?.matricula) === key);
}

export function buildStudentDirectoryEntry(student: StudentLike, sectionId = '', updatedAt = Date.now()) {
  return {
    nombre: normalizeStudentText(student?.nombre),
    apellido: normalizeStudentText(student?.apellido),
    matricula: normalizeStudentMatricula(student?.matricula),
    photoUrl: normalizeStudentText(student?.photoUrl),
    lastSectionId: sectionId || student?.sectionId || student?.courseId || '',
    updatedAt,
  };
}

export function studentDirectoryEntryKey(entry: StudentLike): string {
  return `${normTxt(entry?.nombre)}|${normTxt(entry?.apellido)}|${normalizeMatricula(entry?.matricula)}`;
}

export function upsertStudentDirectoryEntryInList(directory: StudentLike[], entry: StudentLike): StudentLike[] {
  const key = studentDirectoryEntryKey(entry);
  const idx = directory.findIndex((item) => studentDirectoryEntryKey(item) === key);
  if (idx >= 0) directory[idx] = { ...directory[idx], ...entry };
  else directory.push(entry);
  return directory;
}
