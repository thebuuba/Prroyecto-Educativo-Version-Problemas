type BulkEntry = Record<string, any>;
type SectionLike = Record<string, any> | null | undefined;

export function normalizeBulkStudentEntry(entry: BulkEntry = {}) {
  return {
    nombre: entry.nombre,
    apellido: entry.apellido,
    matricula: entry.matricula,
  };
}

export function buildBulkStudentRecord(entry: BulkEntry = {}, section: SectionLike, options: Record<string, any> = {}) {
  const normalized = normalizeBulkStudentEntry(entry);
  const sectionId = options.sectionId || section?.id || '';
  return {
    id: options.id,
    nombre: normalized.nombre,
    apellido: normalized.apellido,
    matricula: normalized.matricula,
    courseId: sectionId,
    sectionId,
    seccionId: sectionId,
    gradeId: section?.gradeId || null,
  };
}

export function buildBulkStudentDirectoryEntry(student: Record<string, any> = {}) {
  return {
    nombre: student.nombre,
    apellido: student.apellido,
    matricula: student.matricula,
    photoUrl: student.photoUrl || '',
    lastSectionId: student.sectionId || student.courseId || '',
  };
}
